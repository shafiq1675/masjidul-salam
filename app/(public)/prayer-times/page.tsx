
export default function PrayerTimes() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-[oklch(97%_0.014_254.604)]">
            <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800">
                ইবাদতের সময়সূচী
            </h1>
            <p className="mt-4 text-lg text-center text-gray-600 max-w-2xl">
                এখানে আপনি আজকের ইবাদতের সময়সূচী দেখতে পারেন। আমাদের মসজিদে পাঁচ ওয়াক্ত নামাজের সময়সূচী অনুসারে ইবাদত করুন এবং আল্লাহর নৈকট্য লাভ করুন।
            </p>
            <div className="mt-6 w-full max-w-md space-y-4">
                {[
                    { name: "ফজর", time: "5:00 AM" },
                    { name: "যোহর", time: "12:30 PM" },
                    { name: "আসর", time: "4:00 PM" },
                    { name: "মাগরিব", time: "6:30 PM" },
                    { name: "এশা", time: "8:00 PM" },
                ].map((item, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-md p-5 flex items-center justify-between hover:shadow-lg transition"
                    >
                        <span className="text-gray-800 font-medium text-lg">
                            {item.name}
                        </span>
                        <span className="text-gray-900 font-semibold">
                            {item.time}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}