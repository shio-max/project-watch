import React from "react";
import { Header, MemberInfo } from "@/types/member";
import { MdModeEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";

interface TableProps {
  headers: Header[];
  items: MemberInfo[];
  onIsEditChange: (member: MemberInfo) => void;
  onDeleteChange: (member: MemberInfo) => void;
}

const Table = ({
  headers,
  items,
  onIsEditChange,
  onDeleteChange,
}: TableProps) => {
  return (
    <div className="relative max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg">
      <table className="w-full border-collapse">
        <thead className="bg-gray-200 sticky top-0 z-10">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="text-left text-gray-700 text-sm font-semibold py-2 px-4 border-b border-gray-200"
              >
                {header.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="hover:bg-blue-50 odd:bg-gray-50">
              {headers.map((header, i) => {
                if (header.value === "delete") {
                  return (
                    <td
                      key={i}
                      className="py-2 px-4 text-primary-600 text-sm font-medium border-b border-gray-200"
                    >
                      <button
                        className="p-2 text-md text-rose-700 rounded-full hover:bg-rose-700 hover:text-white hover:cursor-pointer"
                        onClick={() => onDeleteChange(item)}
                      >
                        <MdDelete />
                      </button>
                    </td>
                  );
                }

                if (header.value === "edit") {
                  return (
                    <td
                      key={i}
                      className="py-2 px-4 text-primary-600 text-sm font-medium border-b border-gray-200"
                    >
                      <button
                        className="p-2 text-md text-secondary rounded-full hover:bg-secondary hover:text-white hover:cursor-pointer"
                        onClick={() => onIsEditChange(item)}
                      >
                        <MdModeEdit />
                      </button>
                    </td>
                  );
                }

                return (
                  <td
                    key={i}
                    className="py-2 px-4 text-gray-800 text-sm border-b border-gray-200"
                  >
                    {item[header.value] || ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
