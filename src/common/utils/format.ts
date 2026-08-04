import { useI18n } from 'vue-i18n'

const CURRENCY_MAP: Record<string, { locale: string; currency: string }> = {
  vi: { locale: 'vi-VN', currency: 'VND' },
  en: { locale: 'en-US', currency: 'USD' },
  ja: { locale: 'ja-JP', currency: 'JPY' },
}

export function useFormatCurrency() {
  const { locale } = useI18n()

  return (amount: number) => {
    const config = CURRENCY_MAP[locale.value] ?? CURRENCY_MAP.vi
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      maximumFractionDigits: 0,
    }).format(amount)
  }
}

/**
 * Strip "(mock)" suffix and translate known Vietnamese notes
 * stored in old database records.
 */
const KNOWN_NOTES: Record<string, Record<string, string>> = {
  'Vận đơn được tạo': {
    vi: 'Vận đơn được tạo',
    en: 'Shipment created',
    ja: '出荷作成済み',
  },
  'Đơn đang chờ lấy hàng': {
    vi: 'Đơn đang chờ lấy hàng',
    en: 'Pending pickup',
    ja: '集荷待ち',
  },
  'Đơn đang trên đường vận chuyển': {
    vi: 'Đơn đang trên đường vận chuyển',
    en: 'In transit',
    ja: '配送中',
  },
  'Giao hàng thành công': {
    vi: 'Giao hàng thành công',
    en: 'Delivered successfully',
    ja: '配達完了',
  },
  'Cập nhật trạng thái vận chuyển': {
    vi: 'Cập nhật trạng thái vận chuyển',
    en: 'Shipping status updated',
    ja: '配送ステータス更新',
  },
  'Cập nhật vị trí vận chuyển': {
    vi: 'Cập nhật vị trí vận chuyển',
    en: 'Shipping location updated',
    ja: '配送位置更新',
  },
}

export function useCleanText() {
  const { locale } = useI18n()

  return (text: string | undefined | null): string => {
    if (!text) return ''
    // Strip (mock) suffix
    let cleaned = text.replace(/\s*\(mock\)\s*$/gi, '').trim()

    // Translate known Vietnamese notes
    const translation = KNOWN_NOTES[cleaned]
    if (translation) {
      cleaned = translation[locale.value] ?? translation.en ?? cleaned
    }

    return cleaned
  }
}
