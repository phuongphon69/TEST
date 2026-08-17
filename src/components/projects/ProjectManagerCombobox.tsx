import React from 'react';
import { SystemUserAutocomplete, SystemUserSelectionData } from './SystemUserAutocomplete';

interface Props {
  selectedId?: string;
  selectedName?: string;
  onChange: (data: {
    id: string;
    name: string;
    rank?: string;
    position?: string;
    unit?: string;
    email?: string;
    responsiblePersonId?: string;
  }) => void;
  required?: boolean;
}

/**
 * ProjectManagerCombobox now delegates exclusively to SystemUserAutocomplete
 * ensuring that Project Responsible Users are selected strictly from System User Accounts
 * (UserAccountRepository / User collection) instead of Personnel/Certificates.
 */
export const ProjectManagerCombobox: React.FC<Props> = ({
  selectedId,
  selectedName,
  onChange,
  required = false
}) => {
  return (
    <SystemUserAutocomplete
      selectedUserId={selectedId}
      selectedName={selectedName}
      required={required}
      onChange={(snap: SystemUserSelectionData) => {
        onChange({
          id: snap.responsibleUserId,
          name: snap.responsibleName,
          rank: snap.responsibleRank,
          position: snap.responsiblePosition,
          unit: snap.unit,
          email: snap.responsibleEmail,
          responsiblePersonId: snap.responsiblePersonId
        });
      }}
    />
  );
};
