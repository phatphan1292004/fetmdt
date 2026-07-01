import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle, WidthType } from "docx";

export const USER_CONTRACT_TEMPLATE = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập – Tự do – Hạnh phúc
--------------------

HỢP ĐỒNG THUÊ PHÒNG TRỌ

Hôm nay, ngày.........tháng …..năm 20…., tại căn nhà số..................Chúng tôi ký tên dưới đây gồm có:

BÊN CHO THUÊ PHÒNG TRỌ (gọi tắt là Bên A):
Ông/bà (tên chủ hợp đồng) ................................................................
CMND/CCCD số................................cấp ngày ..........................nơi cấp ................................
Thường trú tại: ...............................................................................................

BÊN THUÊ PHÒNG TRỌ (gọi tắt là Bên B):
Ông/bà................................................................
CMND/CCCD số................................cấp ngày ..........................nơi cấp ................................
Thường trú tại: ...............................................................................................

Sau khi thỏa thuận, hai bên thống nhất như sau:

1. Nội dung thuê phòng trọ
Bên A cho Bên B thuê 01 phòng trọ số............. tại căn nhà số............................................Với thời hạn là:................ tháng, giá thuê:..........................đồng (Bằng chữ ......................................). Chưa bao gồm chi phí: điện sinh hoạt, nước.

2. Trách nhiệm Bên A
Đảm bảo căn nhà cho thuê không có tranh chấp, khiếu kiện.
Đăng ký với chính quyền địa phương về thủ tục cho thuê phòng trọ.

3. Trách nhiệm Bên B
Đặt cọc với số tiền là............................đồng (Bằng chữ ......................................), thanh toán tiền thuê phòng hàng tháng vào ngày ……. + tiền điện + nước.
Đảm bảo các thiết bị và sửa chữa các hư hỏng trong phòng trong khi sử dụng. Nếu không sửa chữa thì khi trả phòng, bên A sẽ trừ vào tiền đặt cọc, giá trị cụ thể được tính theo giá thị trường.
Chỉ sử dụng phòng trọ vào mục đích ở, với số lượng tối đa không quá 04 người (kể cả trẻ em); không chứa các thiết bị gây cháy nổ, hàng cấm... cung cấp giấy tờ tùy thân để đăng ký tạm trú theo quy định, giữ gìn an ninh trật tự, nếp sống văn hóa đô thị; không tụ tập nhậu nhẹt, cờ bạc và các hành vi vi phạm pháp luật khác.
Không được tự ý cải tạo kiến trúc phòng hoặc trang trí ảnh hưởng tới tường, cột, nền... Nếu có nhu cầu trên phải trao đổi với bên A để được thống nhất

4. Điều khoản thực hiện
Hai bên nghiêm túc thực hiện những quy định trên trong thời hạn cho thuê, nếu bên A lấy phòng phải báo cho bên B ít nhất 01 tháng, hoặc ngược lại.
Sau thời hạn cho thuê ….. tháng nếu bên B có nhu cầu hai bên tiếp tục thương lượng giá thuê để gia hạn hợp đồng bằng miệng hoặc thực hiện như sau.

Số lần gia hạn | Thời gian gia hạn (tháng) | Từ ngày | Đến ngày | Giá thuê/ tháng (triệu đồng) | Ký tên
1              |                           |         |          |                              |
2              |                           |         |          |                              |

        Bên B                                                                 Bên A
(Ký, ghi rõ họ tên)                                             (Ký, ghi rõ họ tên)
`;

export const DEPOSIT_TEMPLATE = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
--------------------

HỢP ĐỒNG ĐẶT CỌC GIỮ CHỖ THUÊ PHÒNG TRỌ

Hôm nay, ngày ...... tháng ...... năm 202...
Chúng tôi gồm:

BÊN NHẬN ĐẶT CỌC (BÊN A):
Họ và tên: .................................................................................................................................
Số CCCD: .................................................................................................................................
Số điện thoại: ...............................................................................................................................

BÊN ĐẶT CỌC (BÊN B):
Họ và tên: .................................................................................................................................
Số CCCD: .................................................................................................................................
Số điện thoại: ...............................................................................................................................

Hai bên thỏa thuận ký kết hợp đồng đặt cọc giữ chỗ thuê phòng với nội dung sau:

1. Bên B tự nguyện đặt cọc cho Bên A số tiền: ........................................ VNĐ (Bằng chữ: ........................................) để giữ chỗ thuê phòng số: ....... tại địa chỉ: ................................................................
2. Giá thuê phòng thỏa thuận chính thức khi ký hợp đồng là: ........................................ VNĐ/tháng.
3. Thời hạn đặt giữ chỗ là từ ngày ..../..../202... đến ngày ..../..../202... (Ngày ký hợp đồng chính thức).
4. Xử lý tiền đặt cọc giữ chỗ:
   - Đến ngày hẹn, nếu Bên B ký hợp đồng thì số tiền đặt cọc này được chuyển thành tiền cọc thuê phòng.
   - Nếu Bên A không cho Bên B thuê phòng như cam kết, Bên A phải trả lại tiền cọc giữ chỗ và bồi thường cho Bên B số tiền tương đương số tiền đã cọc.
   - Nếu Bên B từ chối ký hợp đồng thuê mà không có lý do chính đáng, Bên B sẽ mất số tiền đặt cọc này.

               ĐẠI DIỆN BÊN A                                         ĐẠI DIỆN BÊN B
                 (Ký, ghi rõ họ tên)                                    (Ký, ghi rõ họ tên)
`;

export function generateEContractDownloadText(contract: {
  id: string;
  createdAt: string;
  address: string;
  landlordCccd?: string;
  landlordAddress?: string;
  renterName: string;
  renterCccd?: string;
  renterAddress?: string;
  roomNumber: string;
  periodMonths: string;
  price: string;
  priceText?: string;
  deposit: string;
  depositText?: string;
  sha256?: string;
  signerA?: string;
  signerB?: string;
}, landlordName: string): string {
  const day = contract.createdAt.split("/")[0] || "..";
  const month = contract.createdAt.split("/")[1] || "..";
  const year = contract.createdAt.split("/")[2] || "20..";

  return `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập – Tự do – Hạnh phúc
--------------------

HỢP ĐỒNG THUÊ PHÒNG TRỌ

Hôm nay, ngày ${day} tháng ${month} năm ${year}, tại căn nhà số ${contract.address}. Chúng tôi ký tên dưới đây gồm có:

BÊN CHO THUÊ PHÒNG TRỌ (gọi tắt là Bên A):
Ông/bà: ${landlordName}
CMND/CCCD số: ${contract.landlordCccd || "079075005678"}
Thường trú tại: ${contract.landlordAddress || "Linh Trung, Thủ Đức, TP.HCM"}

BÊN THUÊ PHÒNG TRỌ (gọi tắt là Bên B):
Ông/bà: ${contract.renterName}
CMND/CCCD số: ${contract.renterCccd || "079096001234"}
Thường trú tại: ${contract.renterAddress || "Quận 1, TP.HCM"}

Sau khi thỏa thuận, hai bên thống nhất như sau:

1. Nội dung thuê phòng trọ
Bên A cho Bên B thuê 01 phòng trọ số ${contract.roomNumber} tại căn nhà số ${contract.address}. Với thời hạn là: ${contract.periodMonths} tháng, giá thuê: ${contract.price} (Bằng chữ: ${contract.priceText || "Chưa ghi"}). Chưa bao gồm chi phí: điện sinh hoạt, nước.

2. Trách nhiệm Bên A
Đảm bảo căn nhà cho thuê không có tranh chấp, khiếu kiện.
Đăng ký với chính quyền địa phương về thủ tục cho thuê phòng trọ.

3. Trách nhiệm Bên B
Đặt cọc với số tiền là ${contract.deposit} (Bằng chữ: ${contract.depositText || "Chưa ghi"}), thanh toán tiền thuê phòng hàng tháng vào ngày 05 + tiền điện + nước.
Đảm bảo các thiết bị và sửa chữa các hư hỏng trong phòng trong khi sử dụng. Nếu không sửa chữa thì khi trả phòng, bên A sẽ trừ vào tiền đặt cọc, giá trị cụ thể được tính theo giá thị trường.
Chỉ sử dụng phòng trọ vào mục đích ở, với số lượng tối đa không quá 04 người (kể cả trẻ em); không chứa các thiết bị gây cháy nổ, hàng cấm... cung cấp giấy tờ tùy thân để đăng ký tạm trú theo quy định, giữ gìn an ninh trật tự, nếp sống văn hóa đô thị; không tụ tập nhậu nhẹt, cờ bạc và các hành vi vi phạm pháp luật khác.
Không được tự ý cải tạo kiến trúc phòng hoặc trang trí ảnh hưởng tới tường, cột, nền... Nếu có nhu cầu trên phải trao đổi với bên A để được thống nhất.

4. Điều khoản thực hiện
Hai bên nghiêm túc thực hiện những quy định trên trong thời hạn cho thuê, nếu bên A lấy phòng phải báo cho bên B ít nhất 01 tháng, hoặc ngược lại.
Sau thời hạn cho thuê ${contract.periodMonths} tháng nếu bên B có nhu cầu hai bên tiếp tục thương lượng giá thuê để gia hạn hợp đồng bằng miệng hoặc thực hiện như sau.

Số lần gia hạn | Thời gian gia hạn (tháng) | Từ ngày | Đến ngày | Giá thuê/ tháng (triệu đồng) | Ký tên
1              |                           |         |          |                              |
2              |                           |         |          |                              |

        Bên B                                                                 Bên A
(Chữ ký điện tử xác thực)                                       (Chữ ký điện tử xác thực)

Đây là hợp đồng điện tử.
Được khởi tạo trực tuyến và ký số xác thực bởi hai bên tuân thủ Luật Giao dịch điện tử 2023.
Mã định danh SHA-256 đối chiếu: ${contract.sha256}
Xác nhận ký số:
- Bên A: ${contract.signerA}
- Bên B: ${contract.signerB || "Chưa thực hiện ký kết"}
`;
}

// Generates actual zipped binary DOCX package supporting Times New Roman & real tables
export async function generateDocxBlob(templateType: "lease" | "deposit"): Promise<Blob> {
  const isLease = templateType === "lease";
  
  if (isLease) {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // National Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", bold: true, size: 24, font: "Times New Roman" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Độc lập – Tự do – Hạnh phúc", bold: true, size: 22, font: "Times New Roman" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "--------------------", size: 22, font: "Times New Roman" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
            children: [
              new TextRun({ text: "HỢP ĐỒNG THUÊ PHÒNG TRỌ", bold: true, size: 28, font: "Times New Roman" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Hôm nay, ngày.........tháng …..năm 20…., tại căn nhà số..................Chúng tôi ký tên dưới đây gồm có:", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({ text: "BÊN CHO THUÊ PHÒNG TRỌ (gọi tắt là Bên A):", bold: true, font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 360 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: "Ông/bà (tên chủ hợp đồng) ................................................................", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 360 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: "CMND/CCCD số................................cấp ngày ..........................nơi cấp ................................", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 360 },
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Thường trú tại: ...............................................................................................", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({ text: "BÊN THUÊ PHÒNG TRỌ (gọi tắt là Bên B):", bold: true, font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 360 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: "Ông/bà................................................................", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 360 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: "CMND/CCCD số................................cấp ngày ..........................nơi cấp ................................", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 360 },
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Thường trú tại: ...............................................................................................", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Sau khi thỏa thuận, hai bên thống nhất như sau:", font: "Times New Roman", size: 24 }),
            ],
          }),
          // Clause 1
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 60 },
            children: [
              new TextRun({ text: "1. Nội dung thuê phòng trọ", bold: true, font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { left: 360 },
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Bên A cho Bên B thuê 01 phòng trọ số............. tại căn nhà số............................................Với thời hạn là:................ tháng, giá thuê:..........................đồng (Bằng chữ ......................................). Chưa bao gồm chi phí: điện sinh hoạt, nước.", font: "Times New Roman", size: 24 }),
            ],
          }),
          // Clause 2
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 60 },
            children: [
              new TextRun({ text: "2. Trách nhiệm Bên A", bold: true, font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { left: 360 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: "- Đảm bảo căn nhà cho thuê không có tranh chấp, khiếu kiện.", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { left: 360 },
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "- Đăng ký với chính quyền địa phương về thủ tục cho thuê phòng trọ.", font: "Times New Roman", size: 24 }),
            ],
          }),
          // Clause 3
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 60 },
            children: [
              new TextRun({ text: "3. Trách nhiệm Bên B", bold: true, font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { left: 360 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: "- Đặt cọc với số tiền là............................đồng (Bằng chữ ......................................), thanh toán tiền thuê phòng hàng tháng vào ngày ……. + tiền điện + nước.", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { left: 360 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: "- Đảm bảo các thiết bị và sửa chữa các hư hỏng trong phòng trong khi sử dụng. Nếu không sửa chữa thì khi trả phòng, bên A sẽ trừ vào tiền đặt cọc, giá trị cụ thể được tính theo giá thị trường.", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { left: 360 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: "- Chỉ sử dụng phòng trọ vào mục đích ở, với số lượng tối đa không quá 04 người (kể cả trẻ em); không chứa các thiết bị gây cháy nổ, hàng cấm... cung cấp giấy tờ tùy thân để đăng ký tạm trú theo quy định, giữ gìn an ninh trật tự, nếp sống văn hóa đô thị; không tụ tập nhậu nhẹt, cờ bạc và các hành vi vi phạm pháp luật khác.", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { left: 360 },
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "- Không được tự ý cải tạo kiến trúc phòng hoặc trang trí ảnh hưởng tới tường, cột, nền... Nếu có nhu cầu trên phải trao đổi với bên A để được thống nhất.", font: "Times New Roman", size: 24 }),
            ],
          }),
          // Clause 4
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 60 },
            children: [
              new TextRun({ text: "4. Điều khoản thực hiện", bold: true, font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { left: 360 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: "Hai bên nghiêm túc thực hiện những quy định trên trong thời hạn cho thuê, nếu bên A lấy phòng phải báo cho bên B ít nhất 01 tháng, hoặc ngược lại.", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { left: 360 },
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Sau thời hạn cho thuê ….. tháng nếu bên B có nhu cầu hai bên tiếp tục thương lượng giá thuê để gia hạn hợp đồng bằng miệng hoặc thực hiện như sau.", font: "Times New Roman", size: 24 }),
            ],
          }),
          // Extension Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Số lần gia hạn", bold: true, font: "Times New Roman", size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Thời gian gia hạn (tháng)", bold: true, font: "Times New Roman", size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Từ ngày", bold: true, font: "Times New Roman", size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Đến ngày", bold: true, font: "Times New Roman", size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Giá thuê/tháng", bold: true, font: "Times New Roman", size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Ký tên", bold: true, font: "Times New Roman", size: 20 })] })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1", font: "Times New Roman", size: 20 })] })] }),
                  new TableCell({ children: [] }),
                  new TableCell({ children: [] }),
                  new TableCell({ children: [] }),
                  new TableCell({ children: [] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Ký tên", font: "Times New Roman", size: 20, color: "999999" })] })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "2", font: "Times New Roman", size: 20 })] })] }),
                  new TableCell({ children: [] }),
                  new TableCell({ children: [] }),
                  new TableCell({ children: [] }),
                  new TableCell({ children: [] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Ký tên", font: "Times New Roman", size: 20, color: "999999" })] })] }),
                ]
              })
            ]
          }),
          // Space
          new Paragraph({ spacing: { before: 240 } }),
          // Signatures
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: "BÊN B (Bên thuê)", bold: true, font: "Times New Roman", size: 24 }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: "(Ký, ghi rõ họ tên)", font: "Times New Roman", italics: true, size: 20 }),
                        ],
                      }),
                    ]
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: "BÊN A (Chủ trọ)", bold: true, font: "Times New Roman", size: 24 }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: "(Ký, ghi rõ họ tên)", font: "Times New Roman", italics: true, size: 20 }),
                        ],
                      }),
                    ]
                  })
                ]
              })
            ]
          })
        ],
      }],
    });

    return await Packer.toBlob(doc);
  } else {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", bold: true, size: 24, font: "Times New Roman" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Độc lập - Tự do - Hạnh phúc", bold: true, size: 22, font: "Times New Roman" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "--------------------", size: 22, font: "Times New Roman" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
            children: [
              new TextRun({ text: "HỢP ĐỒNG ĐẶT CỌC GIỮ CHỖ THUÊ PHÒNG TRỌ", bold: true, size: 28, font: "Times New Roman" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Hôm nay, ngày ...... tháng ...... năm 202... Chúng tôi gồm:", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({ text: "BÊN NHẬN ĐẶT CỌC (BÊN A):", bold: true, font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 360 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: "Họ và tên: .................................................................................................................................", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 360 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: "Số CCCD: .................................................................................................................................", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 360 },
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Số điện thoại: ...............................................................................................................................", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({ text: "BÊN ĐẶT CỌC (BÊN B):", bold: true, font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 360 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: "Họ và tên: .................................................................................................................................", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 360 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: "Số CCCD: .................................................................................................................................", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 360 },
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Số điện thoại: ...............................................................................................................................", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Hai bên thỏa thuận ký kết hợp đồng đặt cọc giữ chỗ thuê phòng với nội dung sau:", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 60 },
            children: [
              new TextRun({ text: "1. Bên B tự nguyện đặt cọc cho Bên A số tiền: ........................................ VNĐ (Bằng chữ: ........................................) để giữ chỗ thuê phòng số: ....... tại địa chỉ: ................................................................", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 60 },
            children: [
              new TextRun({ text: "2. Giá thuê phòng thỏa thuận chính thức khi ký hợp đồng là: ........................................ VNĐ/tháng.", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 60 },
            children: [
              new TextRun({ text: "3. Thời hạn đặt giữ chỗ là từ ngày ..../..../202... đến ngày ..../..../202... (Ngày ký hợp đồng chính thức).", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "4. Xử lý tiền đặt cọc giữ chỗ:\n- Đến ngày hẹn, nếu Bên B ký hợp đồng thì số tiền đặt cọc này được chuyển thành tiền cọc thuê phòng.\n- Nếu Bên A không cho Bên B thuê phòng như cam kết, Bên A phải trả lại tiền cọc giữ chỗ và bồi thường cho Bên B số tiền tương đương số tiền đã cọc.\n- Nếu Bên B từ chối ký hợp đồng thuê mà không có lý do chính đáng, Bên B sẽ mất số tiền đặt cọc này.", font: "Times New Roman", size: 24 }),
            ],
          }),
          new Paragraph({ spacing: { before: 240 } }),
          // Signatures
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: "ĐẠI DIỆN BÊN A", bold: true, font: "Times New Roman", size: 24 }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: "(Ký, ghi rõ họ tên)", font: "Times New Roman", italics: true, size: 20 }),
                        ],
                      }),
                    ]
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: "ĐẠI DIỆN BÊN B", bold: true, font: "Times New Roman", size: 24 }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: "(Ký, ghi rõ họ tên)", font: "Times New Roman", italics: true, size: 20 }),
                        ],
                      }),
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }]
    });

    return await Packer.toBlob(doc);
  }
}
