'use client'

import { useState, useTransition, useEffect } from "react"
import { createUser, updateUser } from "@/app/actions/user"
import { getRoles } from "@/app/actions/role"
import { User } from "./types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserFormProps {
  onUserCreatedOrUpdated: () => void
  userToEdit?: User | null
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function UserForm({ onUserCreatedOrUpdated, userToEdit, isOpen, setIsOpen }: UserFormProps) {
  const [isPending, startTransition] = useTransition()
  const [roles, setRoles] = useState<Array<{ id: number; name: string }>>([])
  const [formData, setFormData] = useState({
    username: '',
    roleId: '',
    password: ''
  })

  useEffect(() => {
    if (isOpen) {
      getRoles().then(data => setRoles(data))

      if (userToEdit) {
        setFormData({
          username: userToEdit.username,
          password: '',
          roleId: userToEdit.roleId.toString()
        })
      } else {
        setFormData({
          username: '',
          password: '',
          roleId: ''
        })
      }
    }
  }, [isOpen, userToEdit])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(async () => {
      if (userToEdit) {
        await updateUser(userToEdit.id, {
          username: formData.username,
          roleId: Number(formData.roleId)
        })
      } else {
        await createUser({
          username: formData.username,
          password: formData.password,
          roleId: Number(formData.roleId)
        })
      }
      onUserCreatedOrUpdated()
      setIsOpen(false)
      setFormData({
        username: '',
        roleId: '',
        password: ''
      })
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{userToEdit ? 'Edit User' : 'Create User'}</DialogTitle>
          <DialogDescription>
            {userToEdit ? 'Update the user details below.' : 'Fill in the details below to add a new user.'}
          </DialogDescription>
          <DialogClose />
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input 
            name="username" 
            value={formData.username} 
            onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
            placeholder="Username" 
            required 
          />
          {!userToEdit && (
            <Input 
              name="password" 
              type="password"
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              placeholder="Password" 
              required 
            />
          )}
          <Select
            value={formData.roleId}
            onValueChange={(value) => setFormData({ ...formData, roleId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={isPending}>
            {isPending ? (userToEdit ? 'Updating...' : 'Creating...') : (userToEdit ? 'Update User' : 'Create User')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 