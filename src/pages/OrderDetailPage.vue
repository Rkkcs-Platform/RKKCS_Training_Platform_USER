<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { getErrorMessage, showRequestFailed, showSuccess } from '@/common'
import { useCleanText, useFormatCurrency } from '@/common/utils/format'
import SectionCard from '@/components/shared/SectionCard.vue'
import ShipmentTracking from '@/components/shared/ShipmentTracking.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  fetchMapCities,
  fetchProducts,
  updateOrder,
} from '@/services/order.service'
import { useOrdersStore } from '@/stores/orders'
import type {
  MapCity,
  OrderStatus,
  ProductListItem,
  ShipmentStatus,
} from '@/types/order'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()
const isSaving = ref(false)
const products = ref<ProductListItem[]>([])
const cities = ref<MapCity[]>([])

function translateProductName(name: string) {
  if (/^Sản phẩm mặc định$/i.test(name)) return t('orders.defaultProduct')
  return name
}

const form = reactive({
  status: 'confirmed' as OrderStatus,
  fullName: '',
  phone: '',
  email: '',
  shipmentStatus: 'pending' as ShipmentStatus,
  carrier: '',
  currentLocation: '',
  deliveryAddress: '',
  note: '',
  currentCityId: '',
  destCityId: '',
  productId: '',
  quantity: 1,
})

const orderStatuses: OrderStatus[] = [
  'pending',
  'confirmed',
  'shipping',
  'delivered',
  'cancelled',
]

const shipmentStatuses: ShipmentStatus[] = [
  'pending',
  'in_transit',
  'delivered',
]

const formatCurrency = useFormatCurrency()
const cleanText = useCleanText()

function syncFormFromDetail() {
  const detail = ordersStore.detail
  if (!detail) return

  form.status = detail.status
  const rawName = detail.customer.fullName?.trim() || ''
  form.fullName =
    !rawName || /^chưa cập nhật$/i.test(rawName) || /^customer\s+/i.test(rawName)
      ? ''
      : rawName
  form.phone = detail.customer.phone || ''
  form.email = detail.customer.email || ''
  form.shipmentStatus = detail.shipment?.status || 'pending'
  form.carrier = detail.shipment?.carrier || ''
  form.currentLocation = cleanText(detail.shipment?.currentLocation || '')
  form.deliveryAddress = cleanText(detail.shipment?.deliveryAddress || '')
  form.note = ''
  form.currentCityId =
    detail.shipment?.map?.currentCityId
    || detail.shipment?.map?.current?.cityId
    || ''
  form.destCityId =
    detail.shipment?.map?.destCityId
    || detail.shipment?.map?.destination?.cityId
    || ''
  form.productId = detail.items?.[0]?.productId || ''
  form.quantity = detail.items?.[0]?.quantity || 1
}

async function loadDetail(id: string) {
  try {
    await ordersStore.loadOrderDetail(id)
    syncFormFromDetail()
  } catch {
    ordersStore.clearDetail()
    showRequestFailed(t('orders.loadDetailFailed'))
  }
}

async function loadProducts() {
  try {
    const data = await fetchProducts({ page: 1, limit: 100 })
    products.value = data.items ?? []
    if (!form.productId && products.value[0]) {
      form.productId = products.value[0].id
    }
  } catch {
    // products optional for viewing; save items needs them
  }
}

async function loadCities() {
  try {
    const data = await fetchMapCities()
    cities.value = data.items ?? []
  } catch {
    cities.value = []
  }
}

async function handleSave() {
  const id = String(route.params.id)
  isSaving.value = true
  try {
    const updated = await updateOrder(id, {
      status: form.status,
      customer: {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
      },
      shipment: {
        status: form.shipmentStatus,
        carrier: form.carrier,
        currentLocation: form.currentLocation,
        deliveryAddress: form.deliveryAddress,
        note: form.note || undefined,
        currentCityId: form.currentCityId || undefined,
        destCityId: form.destCityId || undefined,
      },
      items: form.productId
        ? [{ productId: form.productId, quantity: form.quantity }]
        : undefined,
    })
    ordersStore.detail = updated
    syncFormFromDetail()
    showSuccess(t('orders.orderUpdated'))
  } catch (error) {
    showRequestFailed(getErrorMessage(error) || t('orders.orderUpdateFailed'))
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  void loadDetail(String(route.params.id))
  void loadProducts()
  void loadCities()
})

watch(
  () => route.params.id,
  (id) => {
    if (id) void loadDetail(String(id))
  },
)
</script>

<template>
  <div v-if="ordersStore.isLoadingDetail" class="text-muted-foreground">
    {{ t('orders.loadingDetail') }}
  </div>

  <div v-else-if="ordersStore.detail" class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold">{{ ordersStore.detail.orderCode }}</h2>
        <p class="text-sm text-muted-foreground">
          {{ t('orders.transactionCode') }}: {{ ordersStore.detail.transactionCode }}
        </p>
        <p
          v-if="ordersStore.detail.shipment"
          class="text-sm text-muted-foreground"
        >
          {{ t('orders.shipmentCode') }}: {{ ordersStore.detail.shipment.shipmentCode }}
        </p>
      </div>
      <StatusBadge :status="ordersStore.detail.status" />
    </div>

    <SectionCard :title="t('orders.productsTitle')">
      <div
        v-if="!ordersStore.detail.items?.length"
        class="text-sm text-muted-foreground"
      >
        {{ t('orders.noProducts') }}
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="item in ordersStore.detail.items"
          :key="item.id"
          class="flex items-center justify-between gap-3 rounded-xl border p-3"
        >
          <div class="min-w-0">
            <p class="font-semibold">{{ translateProductName(item.productName) }}</p>
            <p class="text-xs text-muted-foreground">
              {{ item.productCode }} · x{{ item.quantity }}
            </p>
          </div>
          <p class="shrink-0 font-semibold">
            {{ formatCurrency(item.lineTotal) }}
          </p>
        </div>
      </div>
      <p class="mt-3 text-sm font-medium">
        {{ t('orders.total') }}:
        {{ formatCurrency(ordersStore.detail.amount) }}
      </p>
    </SectionCard>

    <SectionCard
      v-if="ordersStore.detail.shipment"
      :title="t('orders.trackingTitle')"
    >
      <ShipmentTracking
        :status="ordersStore.detail.shipment.status"
        :timeline="ordersStore.detail.shipment.timeline"
        :events="ordersStore.detail.shipment.events"
        :current-location="cleanText(ordersStore.detail.shipment.currentLocation)"
        :map="ordersStore.detail.shipment.map"
        map-height-class="h-56 sm:h-72"
      />
      <Button
        class="mt-4 w-full sm:w-auto"
        variant="outline"
        @click="
          router.push({
            name: 'shipment-detail',
            params: { id: ordersStore.detail!.shipment!.id },
          })
        "
      >
        {{ t('orders.viewFullTracking') }}
      </Button>
    </SectionCard>

    <SectionCard :title="t('orders.updateOrderTitle')">
      <p class="mb-4 text-sm text-muted-foreground">
        {{ t('orders.transactionCode') }} / {{ t('orders.shipmentCode') }}
        — <strong>{{ t('orders.updateOrderDescriptionCustomer') }}</strong>
      </p>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('orders.orderStatusLabel') }}</label>
          <select
            v-model="form.status"
            class="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option v-for="status in orderStatuses" :key="status" :value="status">
              {{ status }}
            </option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('orders.customerNameLabel') }}</label>
          <Input
            v-model="form.fullName"
            class="h-11"
            :placeholder="t('orders.customerNamePlaceholder')"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('orders.customerPhoneLabel') }}</label>
          <Input
            v-model="form.phone"
            class="h-11"
            :placeholder="t('orders.customerPhonePlaceholder')"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('orders.customerEmailLabel') }}</label>
          <Input
            v-model="form.email"
            class="h-11"
            :placeholder="t('orders.customerEmailPlaceholder')"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('orders.shipmentStatusLabel') }}</label>
          <select
            v-model="form.shipmentStatus"
            class="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option
              v-for="status in shipmentStatuses"
              :key="status"
              :value="status"
            >
              {{ status }}
            </option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('orders.currentCityLabel') }}</label>
          <select
            v-model="form.currentCityId"
            class="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option disabled value="">{{ t('orders.selectCity') }}</option>
            <option
              v-for="city in cities"
              :key="city.id"
              :value="city.id"
            >
              {{ city.name }}
            </option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('orders.destCityLabel') }}</label>
          <select
            v-model="form.destCityId"
            class="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option disabled value="">{{ t('orders.selectCity') }}</option>
            <option
              v-for="city in cities"
              :key="`dest-${city.id}`"
              :value="city.id"
            >
              {{ city.name }}
            </option>
          </select>
        </div>

        <div class="space-y-2 sm:col-span-2">
          <label class="text-sm font-medium">
            {{ t('orders.currentLocationLabel') }}
          </label>
          <Input
            v-model="form.currentLocation"
            class="h-11"
            :placeholder="t('orders.currentLocationPlaceholder')"
          />
          <p class="text-xs text-muted-foreground">
            {{ t('orders.currentLocationHint') }}
          </p>
        </div>

        <div class="space-y-2 sm:col-span-2">
          <label class="text-sm font-medium">
            {{ t('orders.deliveryAddressLabel') }}
          </label>
          <Input
            v-model="form.deliveryAddress"
            class="h-11"
            :placeholder="t('orders.deliveryAddressPlaceholder')"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('orders.carrierLabel') }}</label>
          <Input v-model="form.carrier" class="h-11" />
        </div>

        <div class="space-y-2 sm:col-span-2">
          <label class="text-sm font-medium">{{ t('orders.trackingNoteLabel') }}</label>
          <Input
            v-model="form.note"
            class="h-11"
            :placeholder="t('orders.trackingNotePlaceholder')"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('orders.productLabel') }}</label>
          <select
            v-model="form.productId"
            class="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option disabled value="">{{ t('orders.selectProduct') }}</option>
            <option
              v-for="product in products"
              :key="product.id"
              :value="product.id"
            >
              {{ product.productCode }} — {{ translateProductName(product.name) }}
              ({{ formatCurrency(product.price) }})
            </option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('orders.quantityLabel') }}</label>
          <Input
            v-model.number="form.quantity"
            type="number"
            min="1"
            class="h-11"
          />
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <Button :disabled="isSaving" @click="handleSave">
          {{ isSaving ? t('common.saving') : t('orders.saveUpdate') }}
        </Button>
        <Button
          v-if="ordersStore.detail.shipment"
          variant="outline"
          @click="
            router.push({
              name: 'shipment-detail',
              params: { id: ordersStore.detail!.shipment!.id },
            })
          "
        >
          {{ t('orders.trackShipment') }}
        </Button>
      </div>
    </SectionCard>

    <SectionCard :title="t('orders.paymentTitle')">
      <template v-if="ordersStore.detail.payment">
        <p class="font-medium">
          {{ ordersStore.detail.payment.paymentCode }}
          · {{ ordersStore.detail.payment.method || '—' }}
        </p>
        <StatusBadge
          :status="ordersStore.detail.payment.status"
          class="mt-2"
        />
      </template>
      <p v-else class="text-sm text-muted-foreground">{{ t('orders.noPayment') }}</p>
    </SectionCard>
  </div>

  <div
    v-else
    class="rounded-xl border border-dashed p-10 text-center text-muted-foreground"
  >
    {{ t('orders.orderNotFound') }}
  </div>
</template>
