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