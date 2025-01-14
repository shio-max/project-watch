import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import React, { useMemo } from "react";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { RiDragMove2Line } from "react-icons/ri";
import { MdModeEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { Position } from "@/types/project";
import { MemberInfo } from "@/types/member";
import { CHECKBOX_ITEMS } from "@/constants/project";

type ItemsType = {
  id: UniqueIdentifier;
  member: MemberInfo | undefined;
  positions: Position[];
  isEditMode: boolean;
  onIsEditChange?: () => void;
  onDeleteChange?: () => void;
};

const Items = ({
  id,
  member,
  positions,
  isEditMode,
  onIsEditChange,
  onDeleteChange,
}: ItemsType) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    data: {
      type: "item",
    },
  });

  // positions に対応するチェックアイテムをキャッシュ
  const positionStyles = useMemo(() => {
    return positions.map((position) => {
      const checkItem = CHECKBOX_ITEMS.find((item) => item.id === position.id);
      return {
        id: position.id,
        bg: checkItem?.bg,
        name: position.name,
      };
    });
  }, [positions]);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
      }}
      className={clsx(
        "px-4 py-2 bg-white shadow-md rounded-xl w-full border border-transparent hover:border-gray-200 cursor-pointer",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex justify-between">
        <p className={clsx("text-lg", { "text-gray-400": member?.isDeleted })}>
          {member?.name ?? ""}
        </p>

        {isEditMode && (
          <div className="flex gap-x-2">
            <button
              className="border p-2 text-md text-rose-700 rounded-full  hover:shadow-xl hover:cursor-pointer"
              onClick={onDeleteChange}
            >
              <MdDelete />
            </button>
            <button
              className="border p-2 text-md text-teal-600 rounded-full  hover:shadow-xl hover:cursor-pointer"
              onClick={onIsEditChange}
            >
              <MdModeEdit />
            </button>
            <button
              className="border p-2 text-md text-amber-600  rounded-full  hover:shadow-xl hover:cursor-pointer"
              {...listeners}
            >
              <RiDragMove2Line />
            </button>
          </div>
        )}
      </div>

      {positionStyles.length > 0 && (
        <div className="flex flex-wrap gap-x-1">
          {positionStyles.map((style) => (
            <div
              key={style.id}
              className={
                "flex items-center m-1 px-3 py-1 rounded-full text-white"
              }
              style={{ backgroundColor: style.bg }}
            >
              <span className="text-xs">{style.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Items;
