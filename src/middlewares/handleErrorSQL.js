exports.handleSqlError =(err, res) =>{
  console.error("SQL ERROR:", err.number, err.message);

  switch (err.number) {
    case 2601:
    case 2627:
      return res.status(409).json({status:"fail", message: "Dữ liệu đã tồn tại" });

    case 547:
      return res.status(400).json({status:"fail", message: "Vi phạm ràng buộc dữ liệu" });

    case 515:
      return res.status(400).json({status:"fail", message: "Thiếu dữ liệu bắt buộc" });

    case 208:
    case 207:
      return res.status(500).json({status:"fail", message: "Lỗi cấu trúc database" });

    case 2812:
      return res.status(500).json({status:"fail", message: "Stored Procedure không tồn tại" });

    case 1205:
      return res.status(503).json({status:"fail", message: "Deadlock, thử lại sau" });

    default:
      return res.status(500).json({
        status:"fail",
        message: "Lỗi hệ thống",
      });
  }
}