import { normalizeShellLocale } from "@/i18n/shell/shell.registry";
import type { ShellLocale } from "@/i18n/shell/shell.types";

interface SupportItemCopy {
  readonly title: string;
  readonly description: string;
}

interface SupportFaqCopy {
  readonly question: string;
  readonly answer: string;
}

interface SupportContactCopy extends SupportItemCopy {
  readonly actionLabel: string;
  readonly availability: string;
}

export interface SupportUiCopy {
  readonly hero: {
    readonly eyebrow: string;
    readonly title: string;
    readonly highlight: string;
    readonly description: string;
    readonly benefits: readonly [string, string, string, string];
    readonly mediaAlt: string;
  };
  readonly sections: {
    readonly topicsEyebrow: string;
    readonly topicsTitle: string;
    readonly topicsDescription: string;
    readonly deviceEyebrow: string;
    readonly deviceTitle: string;
    readonly deviceDescription: string;
    readonly faqEyebrow: string;
    readonly faqTitle: string;
    readonly faqDescription: string;
    readonly contactsEyebrow: string;
    readonly contactsTitle: string;
    readonly contactsDescription: string;
  };
  readonly controls: {
    readonly brand: string;
    readonly model: string;
    readonly chooseModel: string;
    readonly search: string;
    readonly searchPlaceholder: string;
    readonly emptyTitle: string;
    readonly emptyDescription: string;
    readonly manualTitle: string;
    readonly manualDescription: string;
  };
  readonly topics: Readonly<Record<string, SupportItemCopy>>;
  readonly status: Readonly<Record<string, SupportItemCopy>>;
  readonly deviceNotes: readonly [string, string];
  readonly manualChecks: readonly SupportItemCopy[];
  readonly faqs: Readonly<Record<string, SupportFaqCopy>>;
  readonly contacts: Readonly<Record<string, SupportContactCopy>>;
}

const SUPPORT_COPY = {
  vi: {
    hero: {
      eyebrow: "Trung tâm hỗ trợ",
      title: "Sẵn sàng đồng hành",
      highlight: "trong mọi hành trình.",
      description:
        "Tìm hướng dẫn cài đặt, kiểm tra thiết bị và câu trả lời cho các vấn đề thường gặp.",
      benefits: [
        "Kiểm tra thiết bị",
        "Hướng dẫn từng bước",
        "Nhiều kênh hỗ trợ",
        "Hỗ trợ 24/7",
      ],
      mediaAlt: "Minh họa trung tâm hỗ trợ YSim",
    },
    sections: {
      topicsEyebrow: "Tìm câu trả lời",
      topicsTitle: "Bạn cần hỗ trợ về vấn đề gì?",
      topicsDescription: "Chọn nhóm nội dung phù hợp để tìm hướng dẫn nhanh.",
      deviceEyebrow: "Kiểm tra thiết bị",
      deviceTitle: "Điện thoại của bạn có hỗ trợ eSIM?",
      deviceDescription:
        "Tra cứu nhanh và kiểm tra thêm trên thiết bị trước khi mua.",
      faqEyebrow: "FAQ",
      faqTitle: "Câu hỏi thường gặp",
      faqDescription:
        "Các câu trả lời ngắn cho những vấn đề phổ biến khi dùng eSIM.",
      contactsEyebrow: "Liên hệ YSim",
      contactsTitle: "Vẫn cần hỗ trợ?",
      contactsDescription:
        "Chọn kênh phù hợp và chuẩn bị mã đơn hàng hoặc thông tin thiết bị.",
    },
    controls: {
      brand: "Hãng điện thoại",
      model: "Model",
      chooseModel: "Chọn model",
      search: "Tìm nhanh",
      searchPlaceholder: "Nhập tên model...",
      emptyTitle: "Chọn thiết bị để kiểm tra",
      emptyDescription:
        "Kết quả sẽ hiển thị trạng thái và các lưu ý cần thiết.",
      manualTitle: "Tự kiểm tra trên điện thoại",
      manualDescription:
        "Dùng các bước dưới đây khi thiết bị chưa có trong danh sách.",
    },
    topics: {
      installation: {
        title: "Cài đặt eSIM",
        description: "Hướng dẫn cài đặt, bật dữ liệu và cấu hình roaming data.",
      },
      device: {
        title: "Kiểm tra thiết bị",
        description:
          "Xác định điện thoại có hỗ trợ eSIM và không bị khóa mạng.",
      },
      payment: {
        title: "Thanh toán",
        description:
          "Tìm hiểu trạng thái giao dịch, hoàn tiền và thanh toán lại.",
      },
      order: {
        title: "Đơn hàng và nhận eSIM",
        description:
          "Kiểm tra email nhận eSIM, mã đơn hàng và tiến trình xử lý.",
      },
    },
    status: {
      supported: {
        title: "Hỗ trợ eSIM",
        description: "Thiết bị này được ghi nhận có hỗ trợ eSIM.",
      },
      conditional: {
        title: "Cần kiểm tra thêm",
        description:
          "Khả năng eSIM có thể phụ thuộc biến thể thị trường và nhà mạng.",
      },
      unsupported: {
        title: "Không hỗ trợ eSIM",
        description: "Thiết bị này không được ghi nhận có eSIM tích hợp.",
      },
    },
    deviceNotes: [
      "Kiểm tra lựa chọn Thêm eSIM trong phần cài đặt SIM hoặc Di động.",
      "Xác nhận mã model và tình trạng khóa mạng trước khi mua.",
    ],
    manualChecks: [
      {
        title: "Tìm mục Thêm eSIM",
        description:
          "Mở phần cài đặt Di động, SIM hoặc Mạng và tìm lựa chọn Thêm eSIM.",
      },
      {
        title: "Kiểm tra mã EID",
        description: "Bấm *#06#. Thiết bị hỗ trợ eSIM thường hiển thị mã EID.",
      },
      {
        title: "Kiểm tra khóa mạng",
        description:
          "Thiết bị bị khóa theo nhà mạng có thể không dùng được eSIM du lịch.",
      },
      {
        title: "Xác nhận mã model",
        description:
          "Cùng một tên máy có thể có biến thể khác nhau theo thị trường.",
      },
    ],
    faqs: {
      "install-before-arrival": {
        question: "Nên cài eSIM trước hay sau khi đến nơi?",
        answer:
          "Nên cài khi có Wi-Fi ổn định và chỉ bật dữ liệu khi đến điểm đến.",
      },
      "delete-esim": {
        question: "Có thể xóa rồi cài lại eSIM không?",
        answer:
          "Nhiều mã QR chỉ cài một lần; không xóa khi chưa được YSim xác nhận.",
      },
      "physical-sim": {
        question: "Có thể dùng SIM vật lý cùng lúc với eSIM không?",
        answer:
          "Nhiều thiết bị hỗ trợ Dual SIM, tùy model và cấu hình thiết bị.",
      },
      "no-eid": {
        question: "Không thấy mã EID thì phải làm sao?",
        answer:
          "Kiểm tra mã model, mục Thêm eSIM và tài liệu của nhà sản xuất.",
      },
      "activation-start": {
        question: "Thời hạn gói bắt đầu khi nào?",
        answer:
          "Thời điểm bắt đầu phụ thuộc chính sách kích hoạt của từng gói.",
      },
    },
    contacts: {
      email: {
        title: "Email hỗ trợ",
        description:
          "Gửi ảnh chụp màn hình, mã đơn hàng hoặc thông tin thiết bị.",
        actionLabel: "Gửi email",
        availability: "Phản hồi theo SLA hỗ trợ",
      },
      zalo: {
        title: "Zalo OA",
        description: "Trao đổi nhanh với bộ phận hỗ trợ YSim bằng tiếng Việt.",
        actionLabel: "Mở Zalo",
        availability: "Theo lịch vận hành",
      },
      telegram: {
        title: "Telegram",
        description:
          "Kênh hỗ trợ thuận tiện cho khách hàng quốc tế và đối tác.",
        actionLabel: "Mở Telegram",
        availability: "Theo lịch vận hành",
      },
      hotline: {
        title: "Hotline",
        description: "Dành cho tình huống cần hỗ trợ khẩn cấp trong chuyến đi.",
        actionLabel: "Xem hotline",
        availability: "Theo lịch vận hành",
      },
    },
  },
  en: {
    hero: {
      eyebrow: "Support center",
      title: "Ready to help",
      highlight: "throughout every journey.",
      description:
        "Find installation guides, check your device, and get answers to common questions.",
      benefits: [
        "Device check",
        "Step-by-step guides",
        "Multiple support channels",
        "24/7 guidance",
      ],
      mediaAlt: "YSim support center illustration",
    },
    sections: {
      topicsEyebrow: "Find an answer",
      topicsTitle: "What do you need help with?",
      topicsDescription: "Choose a topic to find the right guide quickly.",
      deviceEyebrow: "Device check",
      deviceTitle: "Does your phone support eSIM?",
      deviceDescription:
        "Check the list and verify the device before purchasing.",
      faqEyebrow: "FAQ",
      faqTitle: "Frequently asked questions",
      faqDescription: "Short answers to common eSIM questions.",
      contactsEyebrow: "Contact YSim",
      contactsTitle: "Still need help?",
      contactsDescription:
        "Choose a channel and have your order or device details ready.",
    },
    controls: {
      brand: "Phone brand",
      model: "Model",
      chooseModel: "Choose a model",
      search: "Quick search",
      searchPlaceholder: "Enter a model name...",
      emptyTitle: "Choose a device to check",
      emptyDescription: "The result will show its status and important notes.",
      manualTitle: "Check directly on your phone",
      manualDescription: "Use these steps when your device is not listed.",
    },
    topics: {
      installation: {
        title: "Install an eSIM",
        description: "Installation, mobile data, and data-roaming guidance.",
      },
      device: {
        title: "Check your device",
        description: "Confirm eSIM support and carrier-unlocked status.",
      },
      payment: {
        title: "Payments",
        description:
          "Understand transaction status, refunds, and payment retries.",
      },
      order: {
        title: "Orders and delivery",
        description:
          "Check the delivery email, order code, and processing status.",
      },
    },
    status: {
      supported: {
        title: "eSIM supported",
        description: "This device is listed as eSIM compatible.",
      },
      conditional: {
        title: "Check required",
        description: "Support may depend on market variant and carrier.",
      },
      unsupported: {
        title: "eSIM not supported",
        description: "This device is not listed with built-in eSIM support.",
      },
    },
    deviceNotes: [
      "Look for Add eSIM in the SIM or Mobile settings.",
      "Confirm the exact model and carrier-unlocked status before purchasing.",
    ],
    manualChecks: [
      {
        title: "Find Add eSIM",
        description:
          "Open Mobile, SIM, or Network settings and look for Add eSIM.",
      },
      {
        title: "Check the EID",
        description: "Dial *#06#. eSIM devices usually display an EID.",
      },
      {
        title: "Check carrier lock",
        description: "A carrier-locked phone may not accept a travel eSIM.",
      },
      {
        title: "Confirm the model number",
        description: "The same phone name can have different market variants.",
      },
    ],
    faqs: {
      "install-before-arrival": {
        question: "Should I install the eSIM before arrival?",
        answer:
          "Install it with stable Wi-Fi and enable mobile data after arrival.",
      },
      "delete-esim": {
        question: "Can I delete and reinstall an eSIM?",
        answer:
          "Many QR codes work once; do not delete it without confirmation from YSim.",
      },
      "physical-sim": {
        question: "Can I use a physical SIM and eSIM together?",
        answer:
          "Many phones support Dual SIM, depending on model and configuration.",
      },
      "no-eid": {
        question: "What if I cannot find an EID?",
        answer:
          "Check the model number, Add eSIM setting, and manufacturer documentation.",
      },
      "activation-start": {
        question: "When does package validity begin?",
        answer: "The start time depends on each package's activation policy.",
      },
    },
    contacts: {
      email: {
        title: "Email support",
        description: "Send screenshots, your order code, or device details.",
        actionLabel: "Send email",
        availability: "Response under the support SLA",
      },
      zalo: {
        title: "Zalo OA",
        description: "Chat quickly with YSim's Vietnamese support team.",
        actionLabel: "Open Zalo",
        availability: "Operating schedule applies",
      },
      telegram: {
        title: "Telegram",
        description:
          "A convenient channel for international customers and partners.",
        actionLabel: "Open Telegram",
        availability: "Operating schedule applies",
      },
      hotline: {
        title: "Hotline",
        description: "For urgent support while you are travelling.",
        actionLabel: "View hotline",
        availability: "Operating schedule applies",
      },
    },
  },
  lo: {
    hero: {
      eyebrow: "ສູນຊ່ວຍເຫຼືອ",
      title: "ພ້ອມຊ່ວຍເຫຼືອ",
      highlight: "ຕະຫຼອດທຸກການເດີນທາງ.",
      description: "ຄົ້ນຫາຄູ່ມືຕິດຕັ້ງ, ກວດອຸປະກອນ ແລະ ຄຳຕອບທີ່ພົບເລື້ອຍ.",
      benefits: [
        "ກວດອຸປະກອນ",
        "ຄູ່ມືເປັນຂັ້ນຕອນ",
        "ຫຼາຍຊ່ອງທາງ",
        "ຄຳແນະນຳ 24/7",
      ],
      mediaAlt: "ຮູບປະກອບສູນຊ່ວຍເຫຼືອ YSim",
    },
    sections: {
      topicsEyebrow: "ຊອກຫາຄຳຕອບ",
      topicsTitle: "ທ່ານຕ້ອງການຊ່ວຍເຫຼືອຫຍັງ?",
      topicsDescription: "ເລືອກຫົວຂໍ້ເພື່ອພົບຄູ່ມືຢ່າງໄວ.",
      deviceEyebrow: "ກວດອຸປະກອນ",
      deviceTitle: "ໂທລະສັບຂອງທ່ານຮອງຮັບ eSIM ບໍ?",
      deviceDescription: "ກວດລາຍການ ແລະ ຢືນຢັນອຸປະກອນກ່ອນຊື້.",
      faqEyebrow: "FAQ",
      faqTitle: "ຄຳຖາມທີ່ພົບເລື້ອຍ",
      faqDescription: "ຄຳຕອບສັ້ນໆສຳລັບການໃຊ້ eSIM.",
      contactsEyebrow: "ຕິດຕໍ່ YSim",
      contactsTitle: "ຍັງຕ້ອງການຊ່ວຍເຫຼືອ?",
      contactsDescription:
        "ເລືອກຊ່ອງທາງ ແລະ ກຽມລະຫັດຄຳສັ່ງຊື້ ຫຼື ຂໍ້ມູນອຸປະກອນ.",
    },
    controls: {
      brand: "ຍີ່ຫໍ້ໂທລະສັບ",
      model: "ຮຸ່ນ",
      chooseModel: "ເລືອກຮຸ່ນ",
      search: "ຄົ້ນຫາໄວ",
      searchPlaceholder: "ປ້ອນຊື່ຮຸ່ນ...",
      emptyTitle: "ເລືອກອຸປະກອນເພື່ອກວດ",
      emptyDescription: "ຜົນຈະສະແດງສະຖານະ ແລະ ຂໍ້ຄວນລະວັງ.",
      manualTitle: "ກວດເທິງໂທລະສັບ",
      manualDescription: "ໃຊ້ຂັ້ນຕອນນີ້ເມື່ອບໍ່ພົບອຸປະກອນໃນລາຍການ.",
    },
    topics: {
      installation: {
        title: "ຕິດຕັ້ງ eSIM",
        description: "ຄູ່ມືຕິດຕັ້ງ, ເປີດຂໍ້ມູນ ແລະ roaming.",
      },
      device: {
        title: "ກວດອຸປະກອນ",
        description: "ຢືນຢັນການຮອງຮັບ eSIM ແລະ ການລັອກເຄືອຂ່າຍ.",
      },
      payment: {
        title: "ການຊຳລະ",
        description: "ກວດສະຖານະທຸລະກຳ, ຄືນເງິນ ແລະ ລອງຊຳລະອີກ.",
      },
      order: {
        title: "ຄຳສັ່ງຊື້ ແລະ ຮັບ eSIM",
        description: "ກວດອີເມວ, ລະຫັດຄຳສັ່ງຊື້ ແລະ ສະຖານະ.",
      },
    },
    status: {
      supported: {
        title: "ຮອງຮັບ eSIM",
        description: "ອຸປະກອນນີ້ຢູ່ໃນລາຍການຮອງຮັບ eSIM.",
      },
      conditional: {
        title: "ຕ້ອງກວດເພີ່ມ",
        description: "ການຮອງຮັບອາດຂຶ້ນກັບຮຸ່ນຕະຫຼາດ ແລະ ເຄືອຂ່າຍ.",
      },
      unsupported: {
        title: "ບໍ່ຮອງຮັບ eSIM",
        description: "ອຸປະກອນນີ້ບໍ່ຢູ່ໃນລາຍການ eSIM ໃນຕົວ.",
      },
    },
    deviceNotes: [
      "ຊອກຫາ Add eSIM ໃນການຕັ້ງຄ່າ SIM ຫຼື Mobile.",
      "ຢືນຢັນລະຫັດຮຸ່ນ ແລະ ການລັອກເຄືອຂ່າຍກ່ອນຊື້.",
    ],
    manualChecks: [
      {
        title: "ຊອກຫາ Add eSIM",
        description: "ເປີດການຕັ້ງຄ່າ Mobile, SIM ຫຼື Network.",
      },
      {
        title: "ກວດລະຫັດ EID",
        description: "ກົດ *#06#. ອຸປະກອນ eSIM ມັກສະແດງ EID.",
      },
      {
        title: "ກວດການລັອກເຄືອຂ່າຍ",
        description: "ໂທລະສັບທີ່ລັອກອາດໃຊ້ eSIM ທ່ອງທ່ຽວບໍ່ໄດ້.",
      },
      {
        title: "ຢືນຢັນລະຫັດຮຸ່ນ",
        description: "ຊື່ຮຸ່ນດຽວກັນອາດມີຮຸ່ນຕະຫຼາດຕ່າງກັນ.",
      },
    ],
    faqs: {
      "install-before-arrival": {
        question: "ຄວນຕິດຕັ້ງ eSIM ກ່ອນຮອດບໍ?",
        answer: "ຕິດຕັ້ງເມື່ອມີ Wi-Fi ແລະ ເປີດຂໍ້ມູນເມື່ອຮອດ.",
      },
      "delete-esim": {
        question: "ລຶບແລ້ວຕິດຕັ້ງ eSIM ອີກໄດ້ບໍ?",
        answer: "QR ຫຼາຍອັນໃຊ້ຄັ້ງດຽວ; ຢ່າລຶບກ່ອນ YSim ຢືນຢັນ.",
      },
      "physical-sim": {
        question: "ໃຊ້ SIM ຈິງ ແລະ eSIM ພ້ອມກັນໄດ້ບໍ?",
        answer: "ຫຼາຍອຸປະກອນຮອງຮັບ Dual SIM ຕາມຮຸ່ນແລະການຕັ້ງຄ່າ.",
      },
      "no-eid": {
        question: "ຖ້າບໍ່ພົບ EID ຄວນເຮັດແນວໃດ?",
        answer: "ກວດລະຫັດຮຸ່ນ, Add eSIM ແລະ ຄູ່ມືຜູ້ຜະລິດ.",
      },
      "activation-start": {
        question: "ອາຍຸແພັກເກດເລີ່ມເມື່ອໃດ?",
        answer: "ເວລາເລີ່ມຂຶ້ນກັບນະໂຍບາຍເປີດໃຊ້ຂອງແຕ່ລະແພັກເກດ.",
      },
    },
    contacts: {
      email: {
        title: "ອີເມວຊ່ວຍເຫຼືອ",
        description: "ສົ່ງຮູບໜ້າຈໍ, ລະຫັດຄຳສັ່ງຊື້ ຫຼື ຂໍ້ມູນອຸປະກອນ.",
        actionLabel: "ສົ່ງອີເມວ",
        availability: "ຕອບຕາມ SLA",
      },
      zalo: {
        title: "Zalo OA",
        description: "ສົນທະນາກັບທີມຊ່ວຍເຫຼືອພາສາຫວຽດ.",
        actionLabel: "ເປີດ Zalo",
        availability: "ຕາມຕາຕະລາງ",
      },
      telegram: {
        title: "Telegram",
        description: "ຊ່ອງທາງສຳລັບລູກຄ້າສາກົນ ແລະ ຄູ່ຮ່ວມງານ.",
        actionLabel: "ເປີດ Telegram",
        availability: "ຕາມຕາຕະລາງ",
      },
      hotline: {
        title: "Hotline",
        description: "ສຳລັບກໍລະນີດ່ວນລະຫວ່າງເດີນທາງ.",
        actionLabel: "ເບິ່ງ hotline",
        availability: "ຕາມຕາຕະລາງ",
      },
    },
  },
} as const satisfies Readonly<Record<ShellLocale, SupportUiCopy>>;

export function createSupportUiCopy(localeInput: unknown): SupportUiCopy {
  return SUPPORT_COPY[normalizeShellLocale(localeInput)];
}
