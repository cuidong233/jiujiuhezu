
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T extends DefineComponent> = T & DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>>
type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = (T & DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }>)
interface _GlobalComponents {
      'AboutSection': typeof import("../components/AboutSection.vue")['default']
    'AlipayQRPayModal': typeof import("../components/AlipayQRPayModal.vue")['default']
    'AppFooter': typeof import("../components/AppFooter.vue")['default']
    'AppHeader': typeof import("../components/AppHeader.vue")['default']
    'BalanceNotEnoughModal': typeof import("../components/BalanceNotEnoughModal.vue")['default']
    'BannerSection': typeof import("../components/BannerSection.vue")['default']
    'BindEmailModal': typeof import("../components/BindEmailModal.vue")['default']
    'ChangeAvatarModal': typeof import("../components/ChangeAvatarModal.vue")['default']
    'ChangeNicknameModal': typeof import("../components/ChangeNicknameModal.vue")['default']
    'ChangePasswordModal': typeof import("../components/ChangePasswordModal.vue")['default']
    'ContactModal': typeof import("../components/ContactModal.vue")['default']
    'DevLoginTool': typeof import("../components/DevLoginTool.vue")['default']
    'FaqSection': typeof import("../components/FaqSection.vue")['default']
    'GoodsSection': typeof import("../components/GoodsSection.vue")['default']
    'JoinUsModal': typeof import("../components/JoinUsModal.vue")['default']
    'LoginRegisterModal': typeof import("../components/LoginRegisterModal.vue")['default']
    'OptimizedImage': typeof import("../components/OptimizedImage.vue")['default']
    'OrderPayModal': typeof import("../components/OrderPayModal.vue")['default']
    'PaySuccessModal': typeof import("../components/PaySuccessModal.vue")['default']
    'ProfileOverview': typeof import("../components/ProfileOverview.vue")['default']
    'ProfilePersonalInfo': typeof import("../components/ProfilePersonalInfo.vue")['default']
    'ProfileSidebar': typeof import("../components/ProfileSidebar.vue")['default']
    'ReceiptModal': typeof import("../components/ReceiptModal.vue")['default']
    'ServiceModal': typeof import("../components/ServiceModal.vue")['default']
    'TicketApplyModal': typeof import("../components/TicketApplyModal.vue")['default']
    'UnifiedLoginModal': typeof import("../components/UnifiedLoginModal.vue")['default']
    'WalletRechargeModal': typeof import("../components/WalletRechargeModal.vue")['default']
    'WechatQRPayModal': typeof import("../components/WechatQRPayModal.vue")['default']
    'NuxtWelcome': typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
    'NuxtLayout': typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
    'NuxtErrorBoundary': typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
    'ClientOnly': typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
    'DevOnly': typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
    'ServerPlaceholder': typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
    'NuxtLink': typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
    'NuxtLoadingIndicator': typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
    'NuxtTime': typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
    'NuxtRouteAnnouncer': typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
    'NuxtImg': typeof import("../node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue")['default']
    'NuxtPicture': typeof import("../node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue")['default']
    'NuxtPage': typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
    'NoScript': typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
    'Link': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
    'Base': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
    'Title': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
    'Meta': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
    'Style': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
    'Head': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
    'Html': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
    'Body': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
    'NuxtIsland': typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
    'NuxtRouteAnnouncer': IslandComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
      'LazyAboutSection': LazyComponent<typeof import("../components/AboutSection.vue")['default']>
    'LazyAlipayQRPayModal': LazyComponent<typeof import("../components/AlipayQRPayModal.vue")['default']>
    'LazyAppFooter': LazyComponent<typeof import("../components/AppFooter.vue")['default']>
    'LazyAppHeader': LazyComponent<typeof import("../components/AppHeader.vue")['default']>
    'LazyBalanceNotEnoughModal': LazyComponent<typeof import("../components/BalanceNotEnoughModal.vue")['default']>
    'LazyBannerSection': LazyComponent<typeof import("../components/BannerSection.vue")['default']>
    'LazyBindEmailModal': LazyComponent<typeof import("../components/BindEmailModal.vue")['default']>
    'LazyChangeAvatarModal': LazyComponent<typeof import("../components/ChangeAvatarModal.vue")['default']>
    'LazyChangeNicknameModal': LazyComponent<typeof import("../components/ChangeNicknameModal.vue")['default']>
    'LazyChangePasswordModal': LazyComponent<typeof import("../components/ChangePasswordModal.vue")['default']>
    'LazyContactModal': LazyComponent<typeof import("../components/ContactModal.vue")['default']>
    'LazyDevLoginTool': LazyComponent<typeof import("../components/DevLoginTool.vue")['default']>
    'LazyFaqSection': LazyComponent<typeof import("../components/FaqSection.vue")['default']>
    'LazyGoodsSection': LazyComponent<typeof import("../components/GoodsSection.vue")['default']>
    'LazyJoinUsModal': LazyComponent<typeof import("../components/JoinUsModal.vue")['default']>
    'LazyLoginRegisterModal': LazyComponent<typeof import("../components/LoginRegisterModal.vue")['default']>
    'LazyOptimizedImage': LazyComponent<typeof import("../components/OptimizedImage.vue")['default']>
    'LazyOrderPayModal': LazyComponent<typeof import("../components/OrderPayModal.vue")['default']>
    'LazyPaySuccessModal': LazyComponent<typeof import("../components/PaySuccessModal.vue")['default']>
    'LazyProfileOverview': LazyComponent<typeof import("../components/ProfileOverview.vue")['default']>
    'LazyProfilePersonalInfo': LazyComponent<typeof import("../components/ProfilePersonalInfo.vue")['default']>
    'LazyProfileSidebar': LazyComponent<typeof import("../components/ProfileSidebar.vue")['default']>
    'LazyReceiptModal': LazyComponent<typeof import("../components/ReceiptModal.vue")['default']>
    'LazyServiceModal': LazyComponent<typeof import("../components/ServiceModal.vue")['default']>
    'LazyTicketApplyModal': LazyComponent<typeof import("../components/TicketApplyModal.vue")['default']>
    'LazyUnifiedLoginModal': LazyComponent<typeof import("../components/UnifiedLoginModal.vue")['default']>
    'LazyWalletRechargeModal': LazyComponent<typeof import("../components/WalletRechargeModal.vue")['default']>
    'LazyWechatQRPayModal': LazyComponent<typeof import("../components/WechatQRPayModal.vue")['default']>
    'LazyNuxtWelcome': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
    'LazyNuxtLayout': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
    'LazyNuxtErrorBoundary': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
    'LazyClientOnly': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
    'LazyDevOnly': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
    'LazyServerPlaceholder': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
    'LazyNuxtLink': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
    'LazyNuxtLoadingIndicator': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
    'LazyNuxtTime': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
    'LazyNuxtImg': LazyComponent<typeof import("../node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue")['default']>
    'LazyNuxtPicture': LazyComponent<typeof import("../node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue")['default']>
    'LazyNuxtPage': LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
    'LazyNoScript': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
    'LazyLink': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
    'LazyBase': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
    'LazyTitle': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
    'LazyMeta': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
    'LazyStyle': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
    'LazyHead': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
    'LazyHtml': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
    'LazyBody': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
    'LazyNuxtIsland': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<IslandComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export const AboutSection: typeof import("../components/AboutSection.vue")['default']
export const AlipayQRPayModal: typeof import("../components/AlipayQRPayModal.vue")['default']
export const AppFooter: typeof import("../components/AppFooter.vue")['default']
export const AppHeader: typeof import("../components/AppHeader.vue")['default']
export const BalanceNotEnoughModal: typeof import("../components/BalanceNotEnoughModal.vue")['default']
export const BannerSection: typeof import("../components/BannerSection.vue")['default']
export const BindEmailModal: typeof import("../components/BindEmailModal.vue")['default']
export const ChangeAvatarModal: typeof import("../components/ChangeAvatarModal.vue")['default']
export const ChangeNicknameModal: typeof import("../components/ChangeNicknameModal.vue")['default']
export const ChangePasswordModal: typeof import("../components/ChangePasswordModal.vue")['default']
export const ContactModal: typeof import("../components/ContactModal.vue")['default']
export const DevLoginTool: typeof import("../components/DevLoginTool.vue")['default']
export const FaqSection: typeof import("../components/FaqSection.vue")['default']
export const GoodsSection: typeof import("../components/GoodsSection.vue")['default']
export const JoinUsModal: typeof import("../components/JoinUsModal.vue")['default']
export const LoginRegisterModal: typeof import("../components/LoginRegisterModal.vue")['default']
export const OptimizedImage: typeof import("../components/OptimizedImage.vue")['default']
export const OrderPayModal: typeof import("../components/OrderPayModal.vue")['default']
export const PaySuccessModal: typeof import("../components/PaySuccessModal.vue")['default']
export const ProfileOverview: typeof import("../components/ProfileOverview.vue")['default']
export const ProfilePersonalInfo: typeof import("../components/ProfilePersonalInfo.vue")['default']
export const ProfileSidebar: typeof import("../components/ProfileSidebar.vue")['default']
export const ReceiptModal: typeof import("../components/ReceiptModal.vue")['default']
export const ServiceModal: typeof import("../components/ServiceModal.vue")['default']
export const TicketApplyModal: typeof import("../components/TicketApplyModal.vue")['default']
export const UnifiedLoginModal: typeof import("../components/UnifiedLoginModal.vue")['default']
export const WalletRechargeModal: typeof import("../components/WalletRechargeModal.vue")['default']
export const WechatQRPayModal: typeof import("../components/WechatQRPayModal.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue")['default']
export const NuxtPicture: typeof import("../node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue")['default']
export const NuxtPage: typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const NuxtRouteAnnouncer: IslandComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyAboutSection: LazyComponent<typeof import("../components/AboutSection.vue")['default']>
export const LazyAlipayQRPayModal: LazyComponent<typeof import("../components/AlipayQRPayModal.vue")['default']>
export const LazyAppFooter: LazyComponent<typeof import("../components/AppFooter.vue")['default']>
export const LazyAppHeader: LazyComponent<typeof import("../components/AppHeader.vue")['default']>
export const LazyBalanceNotEnoughModal: LazyComponent<typeof import("../components/BalanceNotEnoughModal.vue")['default']>
export const LazyBannerSection: LazyComponent<typeof import("../components/BannerSection.vue")['default']>
export const LazyBindEmailModal: LazyComponent<typeof import("../components/BindEmailModal.vue")['default']>
export const LazyChangeAvatarModal: LazyComponent<typeof import("../components/ChangeAvatarModal.vue")['default']>
export const LazyChangeNicknameModal: LazyComponent<typeof import("../components/ChangeNicknameModal.vue")['default']>
export const LazyChangePasswordModal: LazyComponent<typeof import("../components/ChangePasswordModal.vue")['default']>
export const LazyContactModal: LazyComponent<typeof import("../components/ContactModal.vue")['default']>
export const LazyDevLoginTool: LazyComponent<typeof import("../components/DevLoginTool.vue")['default']>
export const LazyFaqSection: LazyComponent<typeof import("../components/FaqSection.vue")['default']>
export const LazyGoodsSection: LazyComponent<typeof import("../components/GoodsSection.vue")['default']>
export const LazyJoinUsModal: LazyComponent<typeof import("../components/JoinUsModal.vue")['default']>
export const LazyLoginRegisterModal: LazyComponent<typeof import("../components/LoginRegisterModal.vue")['default']>
export const LazyOptimizedImage: LazyComponent<typeof import("../components/OptimizedImage.vue")['default']>
export const LazyOrderPayModal: LazyComponent<typeof import("../components/OrderPayModal.vue")['default']>
export const LazyPaySuccessModal: LazyComponent<typeof import("../components/PaySuccessModal.vue")['default']>
export const LazyProfileOverview: LazyComponent<typeof import("../components/ProfileOverview.vue")['default']>
export const LazyProfilePersonalInfo: LazyComponent<typeof import("../components/ProfilePersonalInfo.vue")['default']>
export const LazyProfileSidebar: LazyComponent<typeof import("../components/ProfileSidebar.vue")['default']>
export const LazyReceiptModal: LazyComponent<typeof import("../components/ReceiptModal.vue")['default']>
export const LazyServiceModal: LazyComponent<typeof import("../components/ServiceModal.vue")['default']>
export const LazyTicketApplyModal: LazyComponent<typeof import("../components/TicketApplyModal.vue")['default']>
export const LazyUnifiedLoginModal: LazyComponent<typeof import("../components/UnifiedLoginModal.vue")['default']>
export const LazyWalletRechargeModal: LazyComponent<typeof import("../components/WalletRechargeModal.vue")['default']>
export const LazyWechatQRPayModal: LazyComponent<typeof import("../components/WechatQRPayModal.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue")['default']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue")['default']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<IslandComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>>

export const componentNames: string[]
