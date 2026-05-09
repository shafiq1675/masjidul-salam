
export default function PermanentMember() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-[oklch(97%_0.014_254.604)]">
            <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800">
                মসজিদুল সালামের স্থায়ী সদস্যগণ
            </h1>

            <div className="mt-6 w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gradient-to-r from-green-500 to-indigo-600 text-white">
                        <tr>
                            <th className="px-6 py-3 font-semibold">নাম</th>
                            <th className="px-6 py-3 font-semibold">পেশা</th>
                            <th className="px-6 py-3 font-semibold">বয়স</th>
                        </tr>
                    </thead>

                    <tbody>
                        {[
                            { name: "মোঃ দেলওার শেক", profession: "কৃষক", age: 45 },
                            { name: "মোঃ ইসমাইল শেখ", profession: "কৃষক", age: 55 },
                            { name: "মোঃ মিন্টু তালুকদার", profession: "ব্যবসায়ী", age: 40 },
                            { name: "মোঃ বাদশা তালুকদার", profession: "কৃষক", age: 54 },
                            { name: "মোঃ আতিয়ার খান", profession: "ব্যবসায়ী", age: 45 },
                            { name: "মোঃ হালিম খান", profession: "ব্যবসায়ী", age: 60 },
                            { name: "মোঃ আক্তার খান", profession: "প্রবাসী", age: 40 },
                        ].map((member, index) => (
                            <tr
                                key={index}
                                className="border-b last:border-none hover:bg-blue-50 transition"
                            >
                                <td className="px-6 py-3 text-gray-800 font-medium">
                                    {member.name}
                                </td>
                                <td className="px-6 py-3">
                                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                                        {member.profession}
                                    </span>
                                </td>
                                <td className="px-6 py-3">
                                    <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
                                        {member.age}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}