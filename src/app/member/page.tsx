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
  const [filteredMemberList, setFilteredMemberList] = useState<MemberInfo[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberInfo | null>(null);
  const [deletedMemberList, setDeletedMemberList] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchBelongTo, setSearchBelongTo] = useState("");

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

  const handleDeletedFilterList = async () => {
    const newDeletedMemberList = !deletedMemberList;
    setDeletedMemberList(newDeletedMemberList);
    await getMembers(newDeletedMemberList);
  };

  const getMembers = async (isDeletedMemberList: boolean) => {
    try {
      setIsLoading(true);
      const membersData = await fetchMembers(isDeletedMemberList);
      setMemberList(membersData);
      setFilteredMemberList(membersData);
    } catch (error) {
      console.error("Error fetching member list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setSearchName("");
    setSearchEmail("");
    setSearchBelongTo("");
    setDeletedMemberList(false);
    await getMembers(false);
  };

  useEffect(() => {
    // 入力フィールドが空の場合、元のリストを表示
    if (!searchName && !searchEmail && !searchBelongTo) {
      setFilteredMemberList(memberList);
    } else {
      const filteredMembers = memberList.filter((member) => {
        return (
          member.name.includes(searchName) &&
          member.email.includes(searchEmail) &&
          member.belong_to.includes(searchBelongTo)
        );
      });
      setFilteredMemberList(filteredMembers);
    }
  }, [searchName, searchEmail, searchBelongTo, memberList]);

  useEffect(() => {
    getMembers(false);
  }, []);

  return (
    <>
      <Loading show={isLoading} />

      <div className="p-6 bg-white">
        <h2 className="text-xl font-bold text-gray-800 mb-2">メンバ一覧</h2>
        <div className="flex items-end justify-between mb-4">
          {/* 絞り込み検索フィールド */}
          <div>
            <div className="flex gap-x-2 items-center">
              <input
                type="text"
                placeholder="名前で検索"
                className="border p-2 rounded"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
              <input
                type="text"
                placeholder="メールアドレスで検索"
                className="border p-2 rounded"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
              <input
                type="text"
                placeholder="所属で検索"
                className="border p-2 rounded"
                value={searchBelongTo}
                onChange={(e) => setSearchBelongTo(e.target.value)}
              />
              <Button className="bg-gray w-32" onClick={handleReset}>
                リセット
              </Button>
            </div>
            <div className="flex items-center mt-4 ">
              <Checkbox
                checked={deletedMemberList}
                onChange={handleDeletedFilterList}
                className="mx-2 group size-6 rounded-sm bg-gray-100 p-1 ring-1 checked:bg-secondary"
              >
                {deletedMemberList && (
                  <FaCheck className="text-primary size-4" />
                )}
              </Checkbox>
              <span className="text-sm">削除済みメンバを表示する</span>
            </div>
          </div>
          {/* END 絞り込み検索フィールド */}

          <Button className="bg-primary" onClick={handleAddClick}>
            メンバ追加
          </Button>
        </div>
        <Table
          headers={getHeaders()}
          items={filteredMemberList}
          onIsEditChange={handleEdit}
          onDeleteChange={handleDelete}
        />
      </div>

      {showMemberModal && (
        <MemberModal
          isEdit={isEdit}
          selectedMember={selectedMember}
          onClose={() => setShowMemberModal(false)}
          onSaveSuccess={getMembers.bind(null, false)}
        />
      )}
    </>
  );
};

export default Member;
