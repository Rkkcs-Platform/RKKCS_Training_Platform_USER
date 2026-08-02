<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getErrorMessage, showRequestFailed, showSuccess } from '@/common'
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

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()
const isSaving = ref(false)
const products = ref<ProductListItem[]>([])
const cities = ref<MapCity[]>([])

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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

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
  form.currentLocation = detail.shipment?.currentLocation || ''
  form.deliveryAddress = detail.shipment?.deliveryAddress || ''
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
    showRequestFailed('Không tải được chi tiết đơn hàng')
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
    showSuccess('Đã cập nhật đơn hàng')
  } catch (error) {
    showRequestFailed(getErrorMessage(error) || 'Cập nhật đơn hàng thất bại')
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
    Đang tải chi tiết đơn hàng...
  </div>

  <div v-else-if="ordersStore.detail" class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold">{{ ordersStore.detail.orderCode }}</h2>
        <p class="text-sm text-muted-foreground">
          Mã giao dịch: {{ ordersStore.detail.transactionCode }}
        </p>
        <p
          v-if="ordersStore.detail.shipment"
          class="text-sm text-muted-foreground"
        >
          Mã vận đơn: {{ ordersStore.detail.shipment.shipmentCode }}
        </p>
      </div>
      <StatusBadge :status="ordersStore.detail.status" />
    </div>

    <SectionCard title="Sản phẩm trong đơn">
      <div
        v-if="!ordersStore.detail.items?.length"
        class="text-sm text-muted-foreground"
      >
        Chưa có sản phẩm
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="item in ordersStore.detail.items"
          :key="item.id"
          class="flex items-center justify-between gap-3 rounded-xl border p-3"
        >
          <div class="min-w-0">
            <p class="font-semibold">{{ item.productName }}</p>
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
        Tổng:
        {{ formatCurrency(ordersStore.detail.amount) }}
      </p>
    </SectionCard>

    <SectionCard
      v-if="ordersStore.detail.shipment"
      title="Tracking vận chuyển"
    >
      <ShipmentTracking
        :status="ordersStore.detail.shipment.status"
        :timeline="ordersStore.detail.shipment.timeline"
        :events="ordersStore.detail.shipment.events"
        :current-location="ordersStore.detail.shipment.currentLocation"
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
        Xem trang tracking đầy đủ
      </Button>
    </SectionCard>

    <SectionCard title="Cập nhật đơn hàng">
      <p class="mb-4 text-sm text-muted-foreground">
        Mã giao dịch / mã vận đơn chỉ là mã hệ thống.
        Thông tin <strong>người đặt</strong> (tên, SĐT, email, địa chỉ giao) nhập riêng bên dưới.
        Đổi <strong>thành phố hiện tại</strong> + <strong>thành phố giao</strong>
        rồi Lưu — map tự nối 2 điểm (data tọa độ mock trong catalog).
      </p>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <label class="text-sm font-medium">Trạng thái đơn</label>
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
          <label class="text-sm font-medium">Tên người đặt hàng</label>
          <Input
            v-model="form.fullName"
            class="h-11"
            placeholder="Nguyễn Văn A"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">SĐT người đặt</label>
          <Input
            v-model="form.phone"
            class="h-11"
            placeholder="0901234567"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Email người đặt</label>
          <Input
            v-model="form.email"
            class="h-11"
            placeholder="email@example.com"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Trạng thái vận đơn</label>
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
          <label class="text-sm font-medium">Thành phố hiện tại (ước lượng)</label>
          <select
            v-model="form.currentCityId"
            class="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option disabled value="">Chọn thành phố</option>
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
          <label class="text-sm font-medium">Thành phố giao hàng (ước lượng)</label>
          <select
            v-model="form.destCityId"
            class="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option disabled value="">Chọn thành phố</option>
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
            Vị trí hiện tại chi tiết (đường / số nhà)
          </label>
          <Input
            v-model="form.currentLocation"
            class="h-11"
            placeholder="VD: 2 Chome-24-12 Shibuya, Shibuya City, Tokyo"
          />
          <p class="text-xs text-muted-foreground">
            Nhập đủ đường + số nhà + thành phố để ghim bản đồ chính xác (OpenStreetMap).
          </p>
        </div>

        <div class="space-y-2 sm:col-span-2">
          <label class="text-sm font-medium">
            Địa chỉ giao hàng chi tiết (đường / số nhà)
          </label>
          <Input
            v-model="form.deliveryAddress"
            class="h-11"
            placeholder="VD: 1 Chome-1-2 Shibuya, Shibuya City, Tokyo 150-0002"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Đơn vị vận chuyển</label>
          <Input v-model="form.carrier" class="h-11" />
        </div>

        <div class="space-y-2 sm:col-span-2">
          <label class="text-sm font-medium">Ghi chú tracking</label>
          <Input
            v-model="form.note"
            class="h-11"
            placeholder="VD: Đã tới hub Quận 7, đang giao..."
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Sản phẩm</label>
          <select
            v-model="form.productId"
            class="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option disabled value="">Chọn sản phẩm</option>
            <option
              v-for="product in products"
              :key="product.id"
              :value="product.id"
            >
              {{ product.productCode }} — {{ product.name }}
              ({{ formatCurrency(product.price) }})
            </option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Số lượng</label>
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
          {{ isSaving ? 'Đang lưu...' : 'Lưu cập nhật' }}
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
          Tracking vận đơn
        </Button>
      </div>
    </SectionCard>

    <SectionCard title="Thanh toán">
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
      <p v-else class="text-sm text-muted-foreground">Chưa có thanh toán</p>
    </SectionCard>
  </div>

  <div
    v-else
    class="rounded-xl border border-dashed p-10 text-center text-muted-foreground"
  >
    Không tìm thấy đơn hàng
  </div>
</template>
