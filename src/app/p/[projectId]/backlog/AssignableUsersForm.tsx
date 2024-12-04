import { useEffect, useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { FormControl, FormItem, FormMessage } from '@/components/ui/form';

interface Assignee {
  userId: string;
  user: {
    name: string;
    email: string;
  };
}

interface AssignableUsersFormProps {
  users: Assignee[]; // List of available users
  assignments: string[]; // List of userIds
  onChange: (value: Assignee[]) => void; // Update function to send full user objects to parent
}

export function AssignableUsersForm({
  users,
  assignments,
  onChange,
}: AssignableUsersFormProps) {

  const handleChange = (selectedUserIds: string[]) => {
    // Get full user objects based on selected userIds
    const selectedUsers = users.filter(user => selectedUserIds.includes(user.userId));
    onChange(selectedUsers); // Send full user objects to the parent component
  };

  return (
    <FormItem>
      <FormControl>
        <Select
          multiple
          onValueChange={handleChange} // Correct handler to process selected userIds
          value={assignments} // Pass the userIds directly
        >
          <SelectTrigger>
            <SelectValue placeholder="Select assignees" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.userId} value={user.userId}>
                {user.user.name} {/* Display the user's name */}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
