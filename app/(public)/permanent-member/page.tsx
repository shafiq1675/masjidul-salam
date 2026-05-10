
import { Eye } from "lucide-react";

export default function PermanentMember() {
    return (
        <div className="min-h-screen w-screen px-4 md:px-10 py-10 bg-[oklch(97%_0.014_254.604)]">

            <h1 className="text-xl md:text-3xl font-bold text-center text-gray-500 mb-8">
                মাসজিদুস সালামের স্থায়ী সদস্যগণ
            </h1>

            <div className="w-full bg-white rounded-2xl shadow-lg overflow-x-auto overflow-y-auto h-[calc(100vh-180px)]">
                <table className="w-full min-w-[900px] border-collapse text-left">

                    <thead className="bg-gradient-to-r from-green-500 to-indigo-600 text-white">
                        <tr>
                            <th className="w-[50px] px-4 py-2 font-semibold">#</th>
                            <th className="px-4 py-2 font-semibold">নাম</th>
                            <th className="px-4 py-2 font-semibold">পেশা</th>
                            <th className="px-4 py-2 font-semibold">বয়স</th>
                            <th className="w-[200px] px-4 py-2 font-semibold">দেখুন</th>
                        </tr>
                    </thead>

                    <tbody>
                        {[
                            { name: "মোঃ দেলোয়ার শেক", profession: "কৃষক", age: "৪৫" },
                            { name: "মোঃ বাদশা শেক", profession: "কৃষক", age: "৪৫" },
                            { name: "মোঃ মাইনুদ্দিন শেক", profession: "কৃষক", age: "৪০" },
                            { name: "মোঃ সওকত শেক", profession: "কৃষক", age: "৩৫" },
                            { name: "মোঃ শাহালম শেক", profession: "কৃষক", age: "২৫" },
                            { name: "মোঃ ইসমাইল শেখ", profession: "কৃষক", age: "৫৫" },
                            { name: "মোঃ কামাল শেখ", profession: "কৃষক", age: "৪০" },
                            { name: "মোঃ আজিজুল শেখ", profession: "কৃষক", age: "৩৫" },
                            { name: "মোঃ দুলাল শেখ", profession: "চাকুরীজীবী", age: "৩২" },
                            { name: "মোঃ চুন্নু শেখ", profession: "কৃষক", age: "৪৫" },
                            { name: "মোঃ বাবলূ শেখ", profession: "কৃষক", age: "৪৫" },
                            { name: "মোঃ হাসান শেখ", profession: "কৃষক", age: "২৫" },
                            { name: "মোঃ মিন্টু তালুকদার", profession: "ব্যবসায়ী", age: "৪০" },
                            { name: "মোঃ লিটু তালুকদার", profession: "ব্যবসায়ী", age: "৪২" },
                            { name: "মোঃ ----- তালুকদার", profession: "ব্যবসায়ী", age: "২৫" },
                            { name: "মোঃ নজরুল তালুকদার", profession: "ব্যবসায়ী", age: "৩০" },
                            { name: "মোঃ মস্তফা তালুকদার", profession: "ব্যবসায়ী", age: "৪০" },
                            { name: "মোঃ কালা তালুকদার", profession: "ব্যবসায়ী", age: "৩৫" },
                            { name: "মোঃ আছমত তালুকদার", profession: "ব্যবসায়ী", age: "৬০" },
                            { name: "মোঃ হাফিজুল তালুকদার", profession: "ব্যবসায়ী", age: "৪০" },
                            { name: "মোঃ ছানু তালুকদার", profession: "ব্যবসায়ী", age: "৬০" },
                            { name: "মোঃ সামাদ তালুকদার", profession: "প্রবাসী", age: "৩৪" },
                            { name: "মোঃ বাদশা তালুকদার", profession: "কৃষক", age: "৬০" },
                            { name: "মোঃ আতিয়ার খান", profession: "ব্যবসায়ী", age: "৪৮" },
                            { name: "মোঃ হালিম খান", profession: "সমাজ সেবক", age: "৬০" },
                            { name: "মোঃ আক্তার খান", profession: "প্রবাসী", age: "৪৫" },
                            { name: "মোঃ জামাল খান", profession: "ব্যবসায়ী", age: "৪৬" },
                            { name: "মোঃ জাহিদ খান", profession: "প্রবাসী", age: "৩৮" },
                            { name: "মোঃ ওমর আলী খান", profession: "সমাজ সেবক", age: "৭০" },
                            { name: "মোঃ সিরাজ খান", profession: "সমাজ সেবক", age: "৬৫" },
                            { name: "মোঃ হোসেন খান", profession: "সমাজ সেবক", age: "৬৪" },
                            { name: "মোঃ হাসান খান", profession: "প্রবাসী", age: "৩০" },
                            { name: "মোঃ নাঈম খান", profession: "ছাত্র", age: "১৭" },
                            { name: "মোঃ মিঠু খান", profession: "প্রবাসী", age: "৩৬" },
                            { name: "মোঃ সাজ্জাদ খান", profession: "প্রবাসী", age: "২৭" },
                            { name: "মোঃ সাফায়েত খান", profession: "প্রবাসী", age: "২৫" },
                            { name: "মোঃ মনির খান", profession: "প্রবাসী", age: "৩২" },
                            { name: "মোঃ শাহ আলম খান", profession: "চাকুরীজীবী", age: "৪০" },
                            { name: "মোঃ সাঈদ খান", profession: "ভেগাবন্ড", age: "৩৫" },
                            { name: "মোঃ রুবেল খান", profession: "চাকুরীজীবী", age: "৩৩" },
                            { name: "মোঃ সোহেল খান", profession: "প্রবাসী", age: "২৮" },
                            { name: "মোঃ এনায়েত খান", profession: "প্রবাসী", age: "৩২" },
                            { name: "মোঃ ইমরান খান", profession: "ব্যবসায়ী", age: "২৮" },
                            { name: "মোঃ আল-আমিন খান", profession: "প্রবাসী", age: "২৬" },
                            { name: "মোঃ শুভ খান", profession: "প্রবাসী", age: "২৩" },
                            { name: "মোঃ নিলয় খান", profession: "ছাত্র", age: "২০" },
                            { name: "মোঃ মেহেদি খান", profession: "প্রবাসী", age: "২৫" },
                            { name: "মোঃ নাসিম খান", profession: "প্রবাসী", age: "২৮" },
                            { name: "মোঃ রাফসান খান", profession: "ছাত্র", age: "১২" },
                            { name: "মোঃ ইব্রাহিম খান", profession: "ছাত্র", age: "১৪" },
                            { name: "মোঃ শাদনান খান", profession: "ছাত্র", age: "৩" },
                            { name: "মোঃ মোহাম্মাদ খান", profession: "ছাত্র", age: "৩" },
                        ].map((member, index) => (
                            <tr
                                key={index}
                                className="border-b last:border-none hover:bg-blue-50 transition duration-200"
                            >
                                <td className="px-2 py-2 text-gray-800 font-medium">
                                    {index + 1}
                                </td>
                                <td className="px-2 py-2 text-gray-800 font-medium">
                                    {member.name}
                                </td>

                                <td className="px-2 py-2">
                                    <span className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-700">
                                        {member.profession}
                                    </span>
                                </td>

                                <td className="px-2 py-2">
                                    <span className="px-2 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
                                        {member.age}
                                    </span>
                                </td>
                                <td className="px-2 py-2">
                                    <button className="px-4 py-2 flex items-center gap-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors">
                                        <Eye size={18} />
                                        দেখুন
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}