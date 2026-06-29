import React from 'react';
import AddMemberForm from './AddMemberForm';
import MembersList from './MembersList';

export default function AddMembers() {
  return (
    <div className="p-4 max-w-full mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Members Management
      </h1>
      <AddMemberForm />
      <MembersList />
    </div>
  );
}
