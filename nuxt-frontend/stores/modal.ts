import { defineStore } from 'pinia'
export const useModalStore = defineStore('modal', {
  state: () => ({ showLogin: false }),
  actions: {
    openLogin() { this.showLogin = true },
    closeLogin() { this.showLogin = false }
  }
}) 