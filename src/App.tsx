/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X, Printer, Upload } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
// @ts-ignore
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

const uploadFileToDrive = async (file: File, folderId: string, accessToken: string) => {
  const metadata = {
    name: file.name,
    parents: [folderId]
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form
  });
  
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
};

type AccordionItemProps = {
  title: string;
  children: React.ReactNode;
};

function AccordionItem({ title, children }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-200 rounded-lg mb-4 overflow-hidden bg-white shadow-sm">
      <button
        className="w-full flex justify-between items-center p-4 bg-slate-50 text-slate-800 font-semibold hover:bg-slate-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="p-4 border-t border-slate-200">
          {children}
        </div>
      )}
    </div>
  );
}

function Toast({ message, type }: { message: string, type: 'success' | 'error' | 'info' }) {
  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  };
  return (
    <div className={`fixed bottom-5 right-5 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-[60]`}>
      {message}
    </div>
  );
}

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-slate-200 rounded-full h-4 mb-8 overflow-hidden">
    <div 
      className="bg-amber-600 h-full transition-all duration-500" 
      style={{ width: `${progress}%` }}
    />
  </div>
);

const trainingData = [
  {
    week: 'Tuần 1',
    session: 'Buổi 1',
    title: 'Xả Co Rút Vật Liệu & Rập Phom Bầu Ngực Thân Trước',
    date: 'CN 18/10/2026',
    goal: 'Chuyển đổi tư duy từ "ủi phẳng" sang "nặn khối 3D"; tấm vải thân trước phẳng phải tự gồ lên một vòm cầu ôm khít bầu ngực tự nhiên.',
    tools: 'Bàn ủi con gà (4-6kg), bàn vỗ gỗ (wooden clapper), gối ủi tròn (tailor\'s ham), khăn ẩm xả nhiệt, thước dây.',
    process: '10:00-10:15: Lý thuyết & Bản chất vật liệu (Video 1). 10:15-10:45: Thợ Cả thị phạm trên nửa thân trước trái. 10:45-11:15: Thợ Phụ thực hành trên nửa thân trước phải. 11:15-11:30: Kiểm tra, Quay video & Giao việc.',
    troubleshooting: 'Thợ Phụ giữ thói quen ủi đồ thường ngày, đưa đẩy bàn ủi trượt ngang trên mặt vải gây dãn dị tật, vặn thân, xệ nách. Chỉnh: Ép lực thẳng đứng 90 độ, xả hơi, nhấc thẳng bàn ủi.',
    acceptance: 'Đặt thân vải tự do trên bàn phẳng, vị trí đỉnh ngực tự gồ lên một vòm cong bán kính 1-1.5cm, vòng nách phẳng phiu không dợn sóng.',
    videoUrl: 'https://www.youtube.com/embed/WSMOo0MbZiw'
  },
  {
    week: 'Tuần 1',
    session: 'Buổi 2',
    title: 'Uốn Cong Chữ S Sống Lưng Thân Sau & Khóa Phom Bằng Clapper',
    date: 'Thứ 3 20/10/2026',
    goal: 'Biến 2 mảnh thân sau phẳng phiu thành đường cong chữ S tương thích hoàn hảo với hõm lưng và bả vai người mặc.',
    tools: 'Bàn ủi nặng, bàn vỗ gỗ (clapper), phấn gạch canh sợi, thước dây.',
    process: '08:00-08:10: Kiểm tra bài cũ. 08:10-08:40: Thợ Cả thị phạm trên 1 mảnh thân sau. 08:40-09:10: Thợ Phụ thực hành trên mảnh thân sau còn lại. 09:10-09:30: Nghiệm thu, Quay video & Bàn giao.',
    troubleshooting: 'Nhiệt không đủ hoặc thiếu clapper khiến sợi len giãn tạm thời, khi nguội co rút lại gây bùng nhăn ngang võng lưng. Chỉnh: Tăng nhiệt, ép clapper tì trọng lượng giữ >= 8 giây.',
    acceptance: 'Đặt mảnh thân sau nằm nghiêng tự nhiên trên mặt bàn phẳng, đường may sống lưng tự uốn lượn cong hình chữ S mềm mại.',
    videoUrl: ''
  },
  {
    week: 'Tuần 1',
    session: 'Buổi 3',
    title: 'Nghiệm Thu Phom Nhiệt Mộc & Cân Bằng Canh Sợi',
    date: 'Thứ 5 22/10/2026',
    goal: 'Khép lại Giai đoạn 1; ghép nối thân mộc sơ bộ để kiểm tra độ rơi tự do theo dây dọi.',
    tools: 'Manocanh chuẩn size, kim ghim định vị, chỉ lược cotton mềm, bàn ủi.',
    process: '08:00-08:15: Ghép thử thân mộc. 08:15-08:50: Đánh giá cân bằng trên manocanh (sườn áo rơi thẳng). 08:50-09:15: Khâu lược cố định & Tháo rã. 09:15-09:30: Nghiệm thu Giai đoạn 1.',
    troubleshooting: 'Ghim ráp sườn áo lệch canh sợi gây giằng xé thân trước-sau. Chỉnh: Tháo ghim, vuốt vải từ nách rơi tự do xuống gấu, lấy điểm bấm eo làm mốc.',
    acceptance: 'Áo mộc treo trên manocanh rủ êm, ngực ôm tròn, sống lưng dính sát vào manocanh, không nếp nhăn kéo căng bất thường.',
    videoUrl: ''
  },
  {
    week: 'Tuần 2',
    session: 'Buổi 4',
    title: 'Pha Cắt Canh Tóc Ngựa Góc Chéo & Mổ Chiết Đỉnh Ngực',
    date: 'Thứ 3 27/10/2026',
    goal: 'Chế tác tầng trợ lực ngực từ sợi lông đuôi ngựa; giải quyết vấn đề cộm dày tại đỉnh chóp ngực.',
    tools: 'Kéo cắt dựng bén, canh tóc đuôi ngựa thô, phấn vẽ, chỉ may sáp, kim khâu tay số 7.',
    process: '08:00-08:15: Xem video (Video 2 - gjw90zC8ljs) & Phân tích cấu trúc. 08:15-08:45: Thợ Cả thị phạm trên lá dựng ngực trái. 08:45-09:15: Thợ Phụ thực hành trên lá dựng ngực phải. 09:15-09:30: Nghiệm thu & Quay video.',
    troubleshooting: 'Máy may chồng 2 mép dựng gây cộm gờ dày làm hỏng độ phẳng mặt vải ngoài. Chỉnh: Trích chỉ máy, gọt sát mép, khâu vắt con bọ Zíc-zắc.',
    acceptance: 'Chóp nón đỉnh ngực đạt độ cong sâu 2cm, đường nối mí phẳng lì khi miết tay.',
    videoUrl: 'https://www.youtube.com/embed/gjw90zC8ljs'
  },
  {
    week: 'Tuần 2',
    session: 'Buổi 5',
    title: 'Phủ Đệm Nỉ Domette & Khâu Lược Trượt Tự Do Cơ Học',
    date: 'Thứ 5 29/10/2026',
    goal: 'Ghép 3 tầng dựng (lanh + tóc ngựa + nỉ) thành khối thống nhất nhưng vẫn trượt động vi mô lên nhau.',
    tools: 'Vải nỉ đệm mềm domette/flannel, chỉ lược cotton thưa màu tương phản, kim khâu tay.',
    process: '08:00-08:15: Kiểm tra bài tập mổ chiết. 08:15-08:45: Thợ Cả thị phạm ghép cụm dựng (lược nan quạt). 08:45-09:15: Thợ Phụ thực hành trên cụm dựng còn lại. 09:15-09:30: Nghiệm thu & Bàn giao.',
    troubleshooting: 'Rút chỉ lược quá căng làm 3 lớp bị bó chặt cơ học, mất linh hoạt, gây sột soạt, gãy nếp. Chỉnh: Cắt chỉ, khâu lại lực tay thả lỏng.',
    acceptance: 'Cụm ngực uốn cong, lớp nỉ và tóc ngựa dịch chuyển trượt tương đối 1-2mm.',
    videoUrl: ''
  },
  {
    week: 'Tuần 2',
    session: 'Buổi 6',
    title: 'Test Nén Mai Rùa & Xử Lý Nẹp Trong, Cơi Túi Lót',
    date: 'Thứ 7 31/10/2026',
    goal: 'Hoàn tất nghiệm thu cụm ngực; chuẩn bị nẹp ve và cơi túi trong.',
    tools: 'Vải lót túi, nẹp vải chính, kéo bấm, bàn ủi, thước kẻ.',
    process: '08:00-08:20: Bài test đàn hồi mai rùa. 08:20-08:50: Xem video (Video 3 - FFrpSKRgTRw) & Thị phạm làm túi ngực trong. 08:50-09:15: Thợ Phụ thực hành mổ cơi túi nẹp trong. 09:15-09:30: Tổng kết Giai đoạn 2.',
    troubleshooting: 'Cắt canh tóc quá sát mép ve gây cộm, gai lông ngựa đâm xuyên lớp lót cọ xát da. Chỉnh: Gọt thụt lùi lớp lông đuôi ngựa vào sâu >= 1.5cm.',
    acceptance: 'Test mai rùa đàn hồi 100%; cơi túi phẳng mịn, góc mổ vuông vức.',
    videoUrl: 'https://www.youtube.com/embed/FFrpSKRgTRw'
  },
  {
    week: 'Tuần 3',
    session: 'Buổi 7',
    title: 'Kỹ Thuật Đột Ve Hạt Kê & Uốn Mo Phom Ve Áo',
    date: 'CN 01/11/2026',
    goal: 'Khâu đột hạt kê (pad stitching) bằng tay tạo độ cuộn tròn tự nhiên cho lá ve mà không lộ vết chỉ mặt ngoài.',
    tools: 'Kim khâu tay số 9, chỉ tơ tằm, sáp ong, gối tròn uốn ve.',
    process: '08:00-08:15: Xem video (Video 4 - whaO7b6c8f8) & Thị phạm thế tay. 08:15-08:45: Thợ Cả cầm tay Thợ Phụ. 08:45-09:15: Thợ Phụ tự thao tác. 09:15-09:30: Nghiệm thu & Giao bài.',
    troubleshooting: 'Đặt bẹp ve xuống bàn làm bằng phẳng quá mức, vi phạm nguyên lý bù chu vi uốn gây bửa ve. Chỉnh: Kê lá ve lên gối tròn, bắt bẻ cong qua ngón tay.',
    acceptance: 'Lật mặt phải: phẳng mịn 100%, không chấm chỉ, ve tự cuộn tròn bán kính 3cm.',
    videoUrl: 'https://www.youtube.com/embed/whaO7b6c8f8'
  },
  {
    week: 'Tuần 3',
    session: 'Buổi 8',
    title: 'Tra Dây Tim Chân Ve (Bridle Tape) Rút Lực Chống Bửa Ve',
    date: 'Thứ 3 03/11/2026',
    goal: 'Kiểm soát lực căng đường bẻ ve để ve luôn ôm sát lồng ngực.',
    tools: 'Dây tim cotton/lanh dày 0.8cm, kim ghim, chỉ lược, phấn vẽ.',
    process: '08:00-08:15: Kiểm tra bài tập đột ve. 08:15-08:45: Thợ Cả thị phạm tra dây tim (rút lực co 0.8-1.2cm). 08:45-09:15: Thợ Phụ thực hành. 09:15-09:30: Nghiệm thu & Quay video.',
    troubleshooting: 'Tra dây tim bằng phẳng tự nhiên gây dãn ve sau vài lần cài cúc. Chỉnh: Rút bớt độ dài dây tim, ghim kéo căng lại trước khi khâu.',
    acceptance: 'Ve áo hít sát ngực, kéo mép ve thả ra phải tự động nảy êm về vị trí cũ.',
    videoUrl: ''
  },
  {
    week: 'Tuần 3',
    session: 'Buổi 9',
    title: 'Kỹ Thuật Kết Thân (Marriage) Theo Trục Xương Cá & Độ Chùng Vi Mô 2%',
    date: 'Thứ 5 05/11/2026',
    goal: 'Ghép dựng vào thân chính; kiểm soát độ rủ tự do theo dây dọi.',
    tools: 'Kim ghim lớn, chỉ lược thưa, bàn may phẳng.',
    process: '08:00-08:15: Lý thuyết về độ dãn canh sợi. 08:15-08:45: Thợ Cả thị phạm lược 4 trục xương cá (độ chùng 2%). 08:45-09:15: Thợ Phụ thực hành trên thân còn lại. 09:15-09:30: Nghiệm thu Giai đoạn 3.',
    troubleshooting: 'Miết căng vải len làm bằng mép tấm dựng gây nhăn xiên từ nách xuống eo sườn. Chỉnh: Xoa dạt vải tự nhiên, để vải chùng nhẹ 2%.',
    acceptance: 'Thân áo treo tự do rủ thẳng đứng vuông góc sàn nhà; vải len phẳng mịn, không vệt kéo căng.',
    videoUrl: ''
  },
  {
    week: 'Tuần 4',
    session: 'Buổi 10',
    title: 'Vào Tim Mép & Kỹ Thuật May Lộn Nhả Lé Hai Chiều',
    date: 'Thứ 3 10/11/2026',
    goal: 'Tạo mép ve áo mỏng nhẹ tinh xảo; triệt tiêu đường chỉ may mí.',
    tools: 'Dây tim viền mép, máy 1 kim, kéo bấm, bàn ủi, dùi gỗ.',
    process: '08:00-08:15: Xem video (Video 5 - sPWdToyQwnY) & Giảng giải quy tắc nhả lé. 08:15-08:45: Thợ Cả thị phạm may lộn, gọt so le. 08:45-09:15: Thợ Phụ thực hành. 09:15-09:30: Nghiệm thu & Quay video.',
    troubleshooting: 'Gọt bằng 3 lớp gây dày cộm đơ cứng như dây thừng. Chỉnh: Gọt giật cấp (so le) từng lớp, gọt sát lớp dựng.',
    acceptance: 'Mép ve mỏng xốp, đường mí giấu kín hoàn toàn.',
    videoUrl: 'https://www.youtube.com/embed/sPWdToyQwnY'
  },
  {
    week: 'Tuần 4',
    session: 'Buổi 11',
    title: 'Chế Tác Bản Lá Cổ Dưới Bằng Nỉ Melton & Đột Hạt Kê',
    date: 'Thứ 5 12/11/2026',
    goal: 'Chế tác bản lá cổ dưới thủ công ôm khít gáy.',
    tools: 'Nỉ melton, vải dựng lanh chéo, kim tay số 8, bàn ủi hơi nước nặng.',
    process: '08:00-08:15: Xem video (Video 6 - A5Py88eLVRc) & Chuẩn bị lá cổ. 08:15-08:45: Thợ Cả thị phạm đột cổ, uốn nhiệt. 08:45-09:15: Thợ Phụ thực hành. 09:15-09:30: Nghiệm thu & Quay video.',
    troubleshooting: 'Đột quá thưa, thiếu uốn cong làm cổ nằm bẹp, gãy gập, tụt lộ cổ sơ mi. Chỉnh: Đột dày 3-4mm, vừa khâu vừa uốn.',
    acceptance: 'Bản cổ tự uốn cong hình móng ngựa, chân cổ đứng vững.',
    videoUrl: 'https://www.youtube.com/embed/A5Py88eLVRc'
  },
  {
    week: 'Tuần 4',
    session: 'Buổi 12',
    title: 'Ráp Bản Cổ Vào Thân & Ủi Cuộn Tự Nhiên (Lapel Roll)',
    date: 'Thứ 7 14/11/2026',
    goal: 'Ráp bản cổ vào thân; định hình độ cuộn mềm mại cho ve.',
    tools: 'Kim tay, chỉ sáp, bàn ủi, bàn vỗ, gối vai.',
    process: '08:00-08:15: Xem video (Video 7 - UpZoxe2QnBs) & Thị phạm điểm nối chân cổ. 08:15-08:45: Thợ Cả thị phạm ráp, ủi cuộn. 08:45-09:15: Thợ Phụ thực hành. 09:15-09:30: Nghiệm thu Giai đoạn 4.',
    troubleshooting: 'Dùng bàn ủi đè chết nếp bẻ ve sắc cạnh gây đơ cứng. Chỉnh: Xịt ẩm, dùng gối tròn và tay cuộn tròn mềm mại, xả hơi định hình.',
    acceptance: 'Cổ ôm khít gáy không hở; lá ve cuộn tròn mềm mại bán kính 3-4cm.',
    videoUrl: 'https://www.youtube.com/embed/UpZoxe2QnBs'
  },
  {
    week: 'Tuần 5',
    session: 'Buổi 13',
    title: 'Cân Bằng Góc Rơi Sinh Lý & Phân Bổ Mọng Đầu Tay 3 – 4 cm',
    date: 'CN 15/11/2026',
    goal: 'Tra tay mọng, góc rơi tự nhiên 15 độ không dúm.',
    tools: 'Chỉ lược đôi, kéo, kim ghim, đệm vai, đệm quả lê.',
    process: '10:00-10:15: Xem video (Video 8 - Gpnnf5bbjvc) & Giảng giải góc rơi. 10:15-10:45: Thợ Cả thị phạm rút mọng, lược. 10:45-11:15: Thợ Phụ thực hành. 11:15-11:30: Nghiệm thu.',
    troubleshooting: 'Dồn mọng vào hõm nách hoặc thiếu ủi co gây dúm xếp ly, gãy vai. Chỉnh: Rút chỉ mọng, ủi nén sạch nếp dúm trên cầu là trước khi tra.',
    acceptance: 'Đầu vai tròn đầy, vòng nách êm, tay đổ nhẹ 15 độ về trước.',
    videoUrl: 'https://www.youtube.com/embed/Gpnnf5bbjvc'
  },
  {
    week: 'Tuần 5',
    session: 'Buổi 14',
    title: 'Đệm Quả Lê, Tra Lót Rủ & Thùa Khuy Mắt Phụng Chỉ Tơ Tằm',
    date: 'Thứ 3 17/11/2026',
    goal: 'Hoàn thiện vai, lót rủ và khuy thủ công.',
    tools: 'Đệm quả lê, lót lụa, chỉ tơ tằm, sợi gân, dùi, đục.',
    process: '08:00-08:15: Xem video (Video 9 - 4r97EzGpyHk) & Chuẩn bị phụ liệu. 08:15-08:45: Thợ Cả thị phạm khóa nách, tra lót, thùa khuy. 08:45-09:15: Thợ Phụ thực hành. 09:15-09:30: Nghiệm thu.',
    troubleshooting: 'Lót căng sát gây kéo giật thân ngoài khi vận động. Chỉnh: Tháo chỉ, nhả độ xếp nếp chùng (pleat ease) 1-1.5cm ở đáy nách.',
    acceptance: 'Lót rủ thoải mái; khuy thùa nổi vân tơ tằm tròn đều, không xước len.',
    videoUrl: 'https://www.youtube.com/embed/4r97EzGpyHk'
  },
  {
    week: 'Tuần 5',
    session: 'Buổi 15',
    title: 'Ủi Mỹ Nghệ Hoàn Thiện (Pressing Off) & Tổng Nghiệm Thu',
    date: 'Thứ 5 19/11/2026',
    goal: 'Hoàn thiện xuất xưởng, tiêu chuẩn KCS 100 sản phẩm.',
    tools: 'Bộ gối ủi, bàn ủi, bàn vỗ, lược chải, manocanh.',
    process: '08:00-08:30: Thao tác ủi mỹ nghệ (lót, sườn, cúp, tay, cổ). 08:30-09:10: Hội đồng nghiệm thu (Bộ 5 Phép Thử KCS). 09:10-09:30: Bàn giao, Ký duyệt, Giải ngân.',
    troubleshooting: 'Dùng bàn ủi ủi trực tiếp gây bóng cháy vải. Chỉnh: Dùng lực ép vuông góc kết hợp khăn ẩm chuyên dụng.',
    acceptance: 'Đạt Bộ 5 Phép Thử KCS: Trượt nổi, Cuộn ve, Mặt phẳng, Góc tay, Dây dọi.',
    videoUrl: ''
  }
];

export default function App() {
  const [selectedSession, setSelectedSession] = useState<typeof trainingData[0] | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string>('Tất cả');
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (needsAuth) {
      alert("Vui lòng đăng nhập để tải lên!");
      return;
    }

    setIsUploading(true);
    showToast("Đang tải lên...", 'info');
    try {
      const folderId = '12AKVDJa8BEcBsh9SYGZPG3V_QAiq1IYg';
      if (!cachedAccessToken) throw new Error("Chưa có token");
      await uploadFileToDrive(file, folderId, cachedAccessToken);
      showToast("Tải lên thành công!", 'success');
    } catch (e) {
      showToast("Tải lên thất bại.", 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredData = selectedWeek === 'Tất cả' 
    ? trainingData 
    : trainingData.filter(d => d.week === selectedWeek);

  const startDate = new Date('2026-10-18');
  const endDate = new Date('2026-11-19');
  const now = new Date();
  
  let progress = 0;
  if (now > startDate) {
    const totalTime = endDate.getTime() - startDate.getTime();
    const elapsedTime = Math.min(now.getTime(), endDate.getTime()) - startDate.getTime();
    progress = Math.round((elapsedTime / totalTime) * 100);
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      {toast && <Toast message={toast.message} type={toast.type} />}
      <header className="max-w-5xl mx-auto mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 uppercase">Quy Trình Huấn Luyện May Đo Full Canvas</h1>
        <p className="text-slate-600 mt-2">PHAN'S CUSTOM TAILOR - Nội bộ</p>
        {needsAuth ? (
          <button onClick={googleSignIn} className="mt-4 bg-amber-600 text-white px-4 py-2 rounded">Đăng nhập với Google để tải lên</button>
        ) : (
          <p className="mt-2 text-green-600">Đã đăng nhập.</p>
        )}
      </header>
      
      <ProgressBar progress={progress} />

      <div className="max-w-5xl mx-auto">
        <AccordionItem title="PHẦN 1: CHƯƠNG TRÌNH ĐÀO TẠO 1:1 CHI TIẾT (5 TUẦN)">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Lọc theo tuần:</label>
            <select 
              value={selectedWeek} 
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option>Tất cả</option>
              {['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5'].map(w => <option key={w}>{w}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-slate-200">
                <tr>
                  <th className="p-2 border">Buổi</th>
                  <th className="p-2 border">Ngày</th>
                  <th className="p-2 border">Kỹ thuật</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((d, i) => (
                  <tr key={i} className="hover:bg-amber-50 cursor-pointer" onClick={() => setSelectedSession(d)}>
                    <td className="p-2 border font-bold">{d.session}</td>
                    <td className="p-2 border">{d.date}</td>
                    <td className="p-2 border">{d.phase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AccordionItem>
        <AccordionItem title="PHẦN 2: QUY TRÌNH KIỂM DUYỆT & VIDEO">
          <ul className="text-sm text-slate-700 list-decimal pl-5 space-y-2">
            <li><strong>Cấu trúc buổi học (90p):</strong> 10p đầu kiểm tra bài cũ, 60p giữa học mới, 20p cuối tổng kết/video.</li>
            <li><strong>Quy định video:</strong> Gửi 02 clip ngắn/buổi (Kỹ thuật thế tay 60-90s, Nghiệm thu chi tiết 30-45s) vào Zalo.</li>
          </ul>
        </AccordionItem>
        <AccordionItem title="PHẦN 3: KỶ LUẬT GIỜ GIẤC & CHẾ TÀI">
          <ul className="text-sm text-slate-700 list-disc pl-5 space-y-2">
            <li><strong>Bữa sáng:</strong> 07:30 - 07:50 (Tiệm mời).</li>
            <li><strong>Giờ vào việc:</strong> Đúng 08:00 (hoặc 10:00 CN).</li>
            <li><strong>Phạt:</strong> 100.000 VNĐ nếu đi trễ.</li>
            <li><strong>Nghỉ đột xuất:</strong> Báo trước 24h, nếu không thợ cả dạy bù không lương.</li>
          </ul>
        </AccordionItem>
        <AccordionItem title="PHẦN 4: CHI PHÍ ĐÀO TẠO & LƯƠNG THỢ CẢ">
          <p className="text-sm text-slate-700">Lương cứng: 3.000.000 VNĐ/khóa (15 buổi). Giải ngân theo đợt nghiệm thu (1tr đợt 1, 2tr đợt 2). Hoa hồng KCS: 50.000 VNĐ/áo (100 áo đầu).</p>
        </AccordionItem>
        <AccordionItem title="PHẦN 5: BẢNG ĐỊNH GIÁ GIA CÔNG">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border">
              <thead>
                <tr><th className="border p-1">Sản phẩm</th><th className="border p-1">Công</th></tr>
              </thead>
              <tbody>
                <tr><td className="border p-1">Ve chết</td><td className="border p-1">750k</td></tr>
                <tr><td className="border p-1">Half Canvas</td><td className="border p-1">1.100k</td></tr>
                <tr><td className="border p-1">Full Canvas</td><td className="border p-1">1.400k</td></tr>
              </tbody>
            </table>
          </div>
        </AccordionItem>
      </div>

      {selectedSession && (
        <div className="fixed inset-0 bg-white z-50 p-8 overflow-y-auto print:p-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-8 print:hidden">
              <button onClick={() => window.print()} className="flex items-center gap-2 text-slate-600 hover:text-amber-700">
                <Printer size={20} /> In chi tiết
              </button>
              <button onClick={() => setSelectedSession(null)} className="p-2 rounded-full hover:bg-slate-100">
                <X size={32} />
              </button>
            </div>
            
            <h2 className="text-3xl font-bold text-slate-900 mb-6">{selectedSession.week} - {selectedSession.session}</h2>
            <p className="text-slate-600 mb-8">{selectedSession.date} | {selectedSession.phase}</p>
            
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Thông tin buổi học</h3>
                <p className="text-slate-700"><strong>Mục tiêu:</strong> {selectedSession.goal}</p>
                <p className="text-slate-700"><strong>Dụng cụ:</strong> {selectedSession.tools}</p>
                <p className="text-slate-700"><strong>Trình tự:</strong> {selectedSession.process}</p>
              </div>
              <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Nghiệm thu & Bắt bệnh</h3>
                <p className="text-amber-800"><strong>Bắt bệnh:</strong> {selectedSession.troubleshooting}</p>
                <p className="text-amber-800"><strong>Nghiệm thu:</strong> {selectedSession.acceptance}</p>
              </div>
              
              {selectedSession.videoUrl && (
                <div className="mt-8">
                  <h3 className="font-semibold mb-4">Video hướng dẫn:</h3>
                  <div className="aspect-video w-full">
                    <iframe 
                      src={selectedSession.videoUrl} 
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
              
              <div className="mt-8 border-t pt-8">
                <h3 className="font-semibold mb-4">Tải lên Ảnh/Video buổi học:</h3>
                <input type="file" onChange={handleFileUpload} disabled={isUploading} className="mb-2" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
