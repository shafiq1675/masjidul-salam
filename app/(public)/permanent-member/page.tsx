"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { subscribeMembers, type FsMember } from "@/lib/db";

export default function PermanentMember() {
  const [members, setMembers] = useState<FsMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeMembers((rows) => {
      setMembers(rows.filter((m) => m.status === "Active"));
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <div className="min-h-screen w-screen px-4 md:px-10 py-10 bg-[oklch(97%_0.014_254.604)]">
      <h1 className="text-xl md:text-3xl font-bold text-center text-gray-500 mb-8">
        মাসজিদুস সালামের স্থায়ী সদস্যগণ
      </h1>

      <div className="w-full bg-white rounded-2xl shadow-lg overflow-x-auto overflow-y-auto h-[calc(100vh-180px)]">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
            কোনো সদস্য পাওয়া যায়নি।
          </div>
        ) : (
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead className="bg-gradient-to-r from-green-500 to-indigo-600 text-white sticky top-0">
              <tr>
                <th className="w-[50px] px-4 py-2 font-semibold">#</th>
                <th className="px-4 py-2 font-semibold">নাম</th>
                <th className="px-4 py-2 font-semibold">পেশা</th>
                <th className="px-4 py-2 font-semibold">ভূমিকা</th>
                <th className="w-[160px] px-4 py-2 font-semibold">দেখুন</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <tr
                  key={member.id}
                  className="border-b last:border-none hover:bg-blue-50 transition duration-200"
                >
                  <td className="px-4 py-2 text-gray-800 font-medium">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2 text-gray-800 font-medium">
                    {member.name}
                  </td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-700">
                      {member.occupations ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button className="px-4 py-2 flex items-center gap-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors">
                      <Eye size={18} />
                      দেখুন
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
