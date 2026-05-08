export interface Env {
  ASSETS: Fetcher
  META_PIXEL_ID: string
  META_ACCESS_TOKEN: string
  META_TEST_EVENT_CODE?: string
}

export type CapiEventName =
  | 'PageView'
  | 'Lead'
  | 'CompleteRegistration'
  | 'ViewContent'
  | 'Contact'

export interface CapiUserData {
  email?: string
  phone?: string
  first_name?: string
  last_name?: string
  country?: string
  city?: string
  fbp?: string
  fbc?: string
  external_id?: string
}

export interface CapiCustomData {
  content_name?: string
  content_category?: string
  currency?: string
  value?: number
  [key: string]: unknown
}

export interface CapiClientPayload {
  event_name: CapiEventName
  event_id: string
  event_time?: number
  event_source_url?: string
  user_data?: CapiUserData
  custom_data?: CapiCustomData
}
