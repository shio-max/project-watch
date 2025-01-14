"use client";

import { useEffect, useState } from "react";
import Table from "@/components/Common/Table";
import Button from "@/components/Common/Button";
import MemberModal from "@/components/Member/Dialogs/MemberInfoDialog";
import Loading from "@/components/Loading";
import { Header, MemberInfo } from "@/types/member";
import { deleteMember, fetchMembers } from "@/utils/firebase/member";
import { Checkbox } from "@headlessui/react";
import { FaCheck } from "react-icons/fa6";

const Member = () => {
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [memberList, setMemberList] = useState<MemberInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberInfo | null>(null);
  const [deletedMemberList, setDeletedMemberList] = useState(false);

  const handleEdit = (member: MemberInfo) => {
    setSelectedMember(member);
    setIsEdit(true);
    setShowMemberModal(true);
  };

  const handleAddClick = () => {
    setSelectedMember(null);
    setIsEdit(false);
    setShowMemberModal(true);
  };

  const handleDelete = async (member: MemberInfo) => {
    if (!member.id) return;

    if (confirm(`本当に ${member.name} を削除しますか？`)) {
      try {
        setIsLoading(true);
        setDeletedMemberList(false);
        await deleteMember(member.id);
        await getMembers(false);
      } catch (error) {
        console.error("Error deleting member:", error);
        alert("削除に失敗しました。再度やり直してください。");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getHeaders = () => {
    const baseHeaders: Header[] = [
      { title: "名前", value: "name" },
      { title: "メールアドレス", value: "email" },
      { title: "所属", value: "belong_to" },
    ];

    if (deletedMemberList) {
      baseHeaders.push({ title: "削除日時", value: "deletedAt" });
    } else {
      baseHeaders.push(
        { title: "削除", value: "delete" },
        { title: "編集", value: "edit" }
      );
    }
    return baseHeaders;
  };

  const handleFilterList = async () => {
    const newDeletedMemberList = !deletedMemberList;
    setDeletedMemberList(newDeletedMemberList);
    await getMembers(newDeletedMemberList);
  };

  const getMembers = async (isDeletedMemberList: boolean) => {
    try {
      setIsLoading(true);
      const membersData = await fetchMembers(isDeletedMemberList);
      setMemberList(membersData);
    } catch (error) {
      console.error("Error fetching member list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetch = async () => {
    setDeletedMemberList(false);
    await getMembers(false);
  };

  useEffect(() => {
    getMembers(false);
  }, []);

  return (
    <>
      <Loading show={isLoading} />
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-2">メンバ一覧</h2>
          <div className="flex items-center justify-between mb-4">
            <div className="flex w-full">
              <Checkbox
                checked={deletedMemberList}
                onChange={handleFilterList}
                className="mx-4 group size-6 rounded-sm bg-gray-100 p-1 ring-1 checked:bg-secondary"
              >
                {deletedMemberList && (
                  <FaCheck className="text-primary size-4" />
                )}
              </Checkbox>
              <span>削除済みメンバを表示する</span>
            </div>
            <Button className="bg-primary" onClick={handleAddClick}>
              メンバ追加
            </Button>
          </div>
          <Table
            headers={getHeaders()}
            items={memberList}
            onIsEditChange={handleEdit}
            onDeleteChange={handleDelete}
          />
        </div>

        {showMemberModal && (
          <MemberModal
            isEdit={isEdit}
            selectedMember={selectedMember}
            onClose={() => setShowMemberModal(false)}
            onSaveSuccess={fetch}
          />
        )}
      </div>
    </>
  );
};

export default Member;
