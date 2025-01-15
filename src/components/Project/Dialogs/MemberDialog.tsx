import Modal from "@/components/Common/Modal";
import Button from "@/components/Common/Button";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { Checkbox } from "@headlessui/react";
import { FaCheck } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { Position } from "@/types/project";
import clsx from "clsx";
import { MemberInfo } from "@/types/member";
import { FiChevronDown } from "react-icons/fi";
import { FiCheck } from "react-icons/fi";
import { CHECKBOX_ITEMS } from "@/constants/project";

type MemberModalProps = {
  showModal: boolean;
  memberId: string;
  onMemberChange: (value: string) => void;
  onAddMember: (selectedPositions: Position[]) => void;
  onEditMember: (selectedPositions: Position[]) => void;
  isEdit: boolean;
  onClose: () => void;
  positions: Position[];
  memberList: MemberInfo[];
};

const MemberModal = ({
  showModal,
  memberId,
  onMemberChange,
  onAddMember,
  onEditMember,
  isEdit,
  onClose,
  positions = [],
  memberList,
}: MemberModalProps) => {
  const [checkedItems, setCheckedItems] = useState(
    structuredClone(CHECKBOX_ITEMS)
  );
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (isEdit) {
      const updatedItems = CHECKBOX_ITEMS.map((item) => ({
        ...item,
        checked: positions.some((position) => position.id === item.id),
      }));
      setCheckedItems(updatedItems);
    }
  }, [isEdit, positions]);

  // チェックボックスの状態を更新する関数
  const handleCheckboxChange = (id: number) => {
    setCheckedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const filteredMembers =
    query === ""
      ? memberList
      : memberList.filter((member) => member.name.includes(query));

  const handleSave = () => {
    const selectedPositions = checkedItems
      .filter((item) => item.checked)
      .map((item) => ({ id: item.id, name: item.label }));

    if (isEdit) {
      onEditMember(selectedPositions);
    } else {
      onAddMember(selectedPositions);
    }

    // モーダルが閉じる前に入力値がリセットされるのを防ぐための遅延処理
    setTimeout(() => {
      setCheckedItems(structuredClone(CHECKBOX_ITEMS));
      setQuery("");
    }, 1000);
  };

  const handleClose = () => {
    setCheckedItems(structuredClone(CHECKBOX_ITEMS));

    setQuery("");
    onClose();
  };

  return (
    <Modal showModal={showModal}>
      <div className="flex flex-col w-full items-start gap-y-4 p-5">
        <p className="text-gray-800 text-2xl font-bold">
          {isEdit ? "メンバ編集" : "メンバ追加"}
        </p>

        <Combobox value={memberId} onChange={onMemberChange}>
          <div className="relative w-full">
            <ComboboxInput
              className={clsx(
                "w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              )}
              displayValue={(id: string) =>
                filteredMembers.find((member) => member.id === id)?.name || ""
              }
              onChange={(event) => setQuery(event.target.value)}
              placeholder="メンバを選択"
            />
            <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
              <FiChevronDown className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
            </ComboboxButton>

            <ComboboxOptions
              className={clsx(
                "absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-gray-300 focus:outline-none",
                "top-full left-0"
              )}
            >
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <ComboboxOption
                    key={member.id}
                    value={member.id}
                    className="group flex cursor-default items-center gap-2 py-1.5 px-3 data-[focus]:bg-primary data-[focus]:text-white "
                  >
                    <FiCheck className="invisible group-data-[selected]:visible" />
                    <span className="data-[selected]:fw-bold">
                      {`${member.name}（${member.belong_to}）`}
                    </span>
                  </ComboboxOption>
                ))
              ) : (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-500">
                  一致するメンバが見つかりません
                </div>
              )}
            </ComboboxOptions>
          </div>
        </Combobox>

        <p className="mt-2">担当</p>
        {checkedItems.map((item) => (
          <div key={item.id} className="flex w-full">
            <Checkbox
              checked={item.checked}
              onChange={() => handleCheckboxChange(item.id)}
              className="mx-4 group size-6 rounded-sm bg-gray-100 p-1 ring-1 checked:bg-primary"
            >
              {item.checked && <FaCheck className="text-primary size-4" />}
            </Checkbox>
            <span>{item.label}</span>
          </div>
        ))}

        <div className="w-full px-4 py-3 flex justify-between">
          <Button className="bg-gray" onClick={handleClose}>
            キャンセル
          </Button>
          <Button
            className="bg-primary"
            disabled={!memberId}
            onClick={handleSave}
          >
            {isEdit ? "編集" : "追加"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MemberModal;
