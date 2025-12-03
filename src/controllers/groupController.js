const { connect } = require('mssql');
const {handleSqlError} = require('../middlewares/handleErrorSQL')
const groupmodel= require('../models/groupModel');
const { connectDB } = require('../config/db');

exports.create_group = async (req,res) =>{
    const id = req.user.id;
    const input = req.body;
    input.created_id=id;
    // console.log(input)
    try {
        const group_id= await groupmodel.add_db_grouplearning(input);
        await groupmodel.add_membership({
            userid: id,
            groupid: group_id.ID,
            role: input.chat_type==="Personal" ?"member":"group_leader"
        })
        res.json({
            status: "success",
            message: "tạo chat area  thành công",
            data:{
                Group_ID: group_id.ID
            }
        })
    } catch (err) {
        handleSqlError(err,res);
    }
}

exports.get_list_group = async (req,res)=>{
    try {
        const userid= req.user.id;
        const result= await groupmodel.get_list_group(userid);
        return res.json({
            status:"success",
            data: result
        })
    } catch (err) {
        handleSqlError(err,res);
    }
}

exports.get_group_detail = async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);

    if (Number.isNaN(groupId)) {
      return res
        .status(400)
        .json({ status: "fail", message: "groupId không hợp lệ" });
    }

    // 1) check group tồn tại
    const group = await groupmodel.get_group_by_id(groupId);
    if (!group) {
      return res
        .status(404)
        .json({ status: "fail", message: "Không tìm thấy group" });
    }

    // 2) lấy danh sách members
    const membersRaw = await groupmodel.get_group_members(groupId);
    const members = membersRaw.map((m) => ({
      userId: m.userId,
      username: m.username,
      role: m.role === "group_leader" ? "trưởng nhóm" : "thành viên",
    }));

    return res.json({
      status: "success",
      data: {
        groupId: group.groupId,
        groupName: group.groupName,
        members,
        createdAt: group.createdAt,
      },
    });
  } catch (err) {
    handleSqlError(err, res);
  }
};

exports.invite_member = async (req, res) => {
  try {
    const fromUserId = req.user.id;
    const groupId = parseInt(req.params.groupId, 10);
    const toUserId = parseInt(req.body.userId, 10);

    if (Number.isNaN(groupId)) {
      return res.status(400).json({ status: "fail", message: "groupId không hợp lệ" });
    }
    if (Number.isNaN(toUserId)) {
      return res.status(400).json({ status: "fail", message: "userId không hợp lệ" });
    }
    if (fromUserId === toUserId) {
      return res.status(400).json({ status: "fail", message: "Không thể tự mời chính mình" });
    }

    // group tồn tại?
    const group = await groupmodel.get_group_by_id(groupId);
    if (!group) {
      return res.status(404).json({ status: "fail", message: "Không tìm thấy group" });
    }

    const inviterIsMember = await groupmodel.is_user_in_group(fromUserId, groupId);
    if (!inviterIsMember) {
    return res.status(403).json({ status: "fail", message: "Bạn không phải thành viên của group này" });
    }

    // user được mời tồn tại?
    const userOk = await groupmodel.user_exists(toUserId);
    if (!userOk) {
      return res.status(404).json({ status: "fail", message: "Không tìm thấy user" });
    }

    // đã là member chưa?
    const alreadyMember = await groupmodel.is_user_in_group(toUserId, groupId);
    if (alreadyMember) {
      return res.status(409).json({ status: "fail", message: "User đã là thành viên của group" });
    }

    const currentCount = await groupmodel.count_group_members(groupId);
    if (currentCount >= group.maxMembers) {
    return res.status(409).json({
        status: "fail",
        message: "Group đã đủ số lượng thành viên"
    });
    }

    // đã có invite pending chưa?
    const pending = await groupmodel.get_pending_invite(groupId, toUserId);
    if (pending) {
      return res.status(409).json({ status: "fail", message: "Đã có lời mời pending cho user này" });
    }

    // tạo invite
    const inviteId = await groupmodel.create_group_invite({
      groupId,
      fromUserId,
      toUserId
    });

    return res.json({
      status: "success",
      data: { inviteId }
    });
  } catch (err) {
    handleSqlError(err, res);
  }
};

exports.remove_member = async (req, res) => {
  const groupId = parseInt(req.params.groupId, 10);
  const userId = parseInt(req.params.userId, 10);
  const currentUserId = req.user.id; // từ token

  if (Number.isNaN(groupId) || Number.isNaN(userId)) {
    return res
      .status(400)
      .json({ status: "fail", message: "groupId hoặc userId không hợp lệ" });
  }

  try {
    // 1) check group tồn tại
    const group = await groupmodel.get_group_by_id(groupId);
    if (!group) {
      return res
        .status(404)
        .json({ status: "fail", message: "Không tìm thấy group" });
    }

    // 2) người gọi API phải là member của group
    const callerIsMember = await groupmodel.is_user_in_group(currentUserId, groupId);
    if (!callerIsMember) {
      return res
        .status(403)
        .json({ status: "fail", message: "Bạn không phải thành viên của group này" });
    }

    // 3) người gọi phải là trưởng nhóm
    const callerRole = await groupmodel.get_user_role_in_group(currentUserId, groupId);
    if (callerRole !== 'group_leader') {
      return res
        .status(403)
        .json({ status: "fail", message: "Chỉ trưởng nhóm mới được xóa thành viên" });
    }

    // 4) không cho tự xóa chính mình (optional – nếu muốn cho xóa thì bỏ block này)
    if (currentUserId === userId) {
      return res
        .status(400)
        .json({ status: "fail", message: "Trưởng nhóm không thể tự xóa chính mình" });
    }

    // 5) check user bị xóa có đang là member không
    const targetIsMember = await groupmodel.is_user_in_group(userId, groupId);
    if (!targetIsMember) {
      return res
        .status(404)
        .json({ status: "fail", message: "User không phải thành viên trong group" });
    }

    // 6) thực hiện xóa
    await groupmodel.remove_member(groupId, userId);

    return res.json({
      status: "success",
      message: "Xóa thành viên thành công",
    });
  } catch (err) {
    handleSqlError(err, res);
  }
};

exports.leave_group = async (req, res) => {
  const groupId = parseInt(req.params.groupId, 10);
  const currentUserId = req.user.id; // lấy từ token

  if (Number.isNaN(groupId)) {
    return res
      .status(400)
      .json({ status: "fail", message: "groupId không hợp lệ" });
  }

  try {
    // 1) check group tồn tại
    const group = await groupmodel.get_group_by_id(groupId);
    if (!group) {
      return res
        .status(404)
        .json({ status: "fail", message: "Không tìm thấy group" });
    }

    // 2) user có đang trong group không
    const isMember = await groupmodel.is_user_in_group(currentUserId, groupId);
    if (!isMember) {
      return res
        .status(404)
        .json({ status: "fail", message: "Bạn không phải thành viên của group này" });
    }

    // 3) nếu là trưởng nhóm thì chặn không cho rời
    const role = await groupmodel.get_user_role_in_group(currentUserId, groupId);
    if (role === 'group_leader') {
      return res
        .status(400)
        .json({
          status: "fail",
          message: "Trưởng nhóm không thể rời nhóm. Hãy chuyển quyền hoặc xử lý theo quy định hệ thống."
        });
    }

    // 4) thực hiện rời nhóm = xóa khỏi Membership
    await groupmodel.remove_member(groupId, currentUserId);

    return res.json({
      status: "success",
      message: "Rời nhóm thành công"
    });
  } catch (err) {
    handleSqlError(err, res);
  }
};

exports.delete_group = async (req, res) => {
  const groupId = parseInt(req.params.groupId, 10);
  const currentUserId = req.user.id; // lấy từ token

  if (Number.isNaN(groupId)) {
    return res
      .status(400)
      .json({ status: "fail", message: "groupId không hợp lệ" });
  }

  try {
    // 1) check group tồn tại
    const group = await groupmodel.get_group_by_id(groupId);
    if (!group) {
      return res
        .status(404)
        .json({ status: "fail", message: "Không tìm thấy group" });
    }

    // 2) user gọi API phải là thành viên group
    const isMember = await groupmodel.is_user_in_group(currentUserId, groupId);
    if (!isMember) {
      return res
        .status(403)
        .json({ status: "fail", message: "Bạn không phải thành viên của group này" });
    }

    // 3) phải là trưởng nhóm
    const role = await groupmodel.get_user_role_in_group(currentUserId, groupId);
    if (role !== 'group_leader') {
      return res
        .status(403)
        .json({ status: "fail", message: "Chỉ trưởng nhóm mới được xóa nhóm" });
    }

    // 4) thực hiện xóa nhóm
    await groupmodel.delete_group(groupId);

    return res.json({
      status: "success",
      message: "Xóa nhóm thành công"
    });
  } catch (err) {
    handleSqlError(err, res);
  }
};