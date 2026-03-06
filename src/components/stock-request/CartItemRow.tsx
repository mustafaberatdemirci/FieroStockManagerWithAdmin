import React from 'react';
import { Trash2 } from 'lucide-react';
import Select from 'react-select';
import { formatPrice } from '../../utils/format';
import type { UseFormRegister } from 'react-hook-form';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StockItem {
    id?: string;
    code: string;
    name: string;
    requestedAmount: number;
    price: number;
    vatRate: number;
}

export interface SelectOption {
    value: string;
    label: string;
    price: number;
    vatRate: number;
    name: string;
}

interface CustomOptionProps {
    innerProps: React.HTMLProps<HTMLDivElement>;
    data: { name: string; price: number };
}

const CustomOption = ({ innerProps, data }: CustomOptionProps) => (
    <div
        {...innerProps}
        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100"
    >
        <div className="flex-1">
            <div className="text-sm font-medium">{data.name}</div>
            <div className="text-xs text-gray-600">{formatPrice(data.price)}</div>
        </div>
    </div>
);

// ─── Component ───────────────────────────────────────────────────────────────

interface CartItemRowProps {
    index: number;
    item: StockItem;
    selectOptions: SelectOption[];
    productsLoading: boolean;
    productsError: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    register: UseFormRegister<any>;
    onUpdate: (index: number, field: keyof StockItem, value: string | number) => void;
    onRemove: (index: number) => void;
}

export function CartItemRow({
    index,
    item,
    selectOptions,
    productsLoading,
    productsError,
    register,
    onUpdate,
    onRemove,
}: CartItemRowProps) {
    return (
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
                {/* Hidden fields for react-hook-form registration */}
                <input type="hidden" {...register(`items.${index}.code` as const)} />
                <input type="hidden" {...register(`items.${index}.name` as const)} />
                <input type="hidden" {...register(`items.${index}.price` as const, { valueAsNumber: true })} />
                <input type="hidden" {...register(`items.${index}.vatRate` as const, { valueAsNumber: true })} />

                <div className="sm:col-span-5">
                    <label className="block text-sm text-gray-600 mb-1">Ürün</label>
                    <Select
                        value={
                            item.code
                                ? selectOptions.find((option) => option.value === item.code)
                                : null
                        }
                        onChange={(newValue: SelectOption | null) =>
                            onUpdate(index, 'code', newValue?.value || '')
                        }
                        options={selectOptions}
                        components={{ Option: CustomOption }}
                        placeholder={productsLoading ? 'Ürünler yükleniyor...' : 'Ürün Seçin veya Arayın...'}
                        noOptionsMessage={() => productsLoading ? 'Ürünler yükleniyor...' : 'Ürün bulunamadı'}
                        isLoading={productsLoading}
                        isDisabled={productsLoading || productsError}
                        classNames={{
                            control: () => '!min-h-[42px]',
                            menu: () => 'mt-1 bg-white border border-gray-300 rounded-lg shadow-lg',
                            option: () => 'cursor-pointer text-sm',
                        }}
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Miktar</label>
                    <input
                        {...register(`items.${index}.requestedAmount` as const, { valueAsNumber: true })}
                        type="number"
                        min="0"
                        className="w-full h-[42px] px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) =>
                            onUpdate(index, 'requestedAmount', parseInt(e.target.value) || 0)
                        }
                        required
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">KDV Hariç</label>
                    <input
                        type="text"
                        readOnly
                        className="w-full h-[42px] px-3 bg-gray-100 border border-gray-300 rounded-lg text-right font-medium text-gray-900"
                        value={formatPrice(item.price * item.requestedAmount)}
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">KDV Dahil</label>
                    <input
                        type="text"
                        readOnly
                        className="w-full h-[42px] px-3 bg-gray-100 border border-gray-300 rounded-lg text-right font-medium text-gray-900"
                        value={formatPrice(
                            item.price * item.requestedAmount * (1 + item.vatRate)
                        )}
                    />
                </div>

                <div className="sm:col-span-1">
                    <label className="block text-sm text-gray-600 mb-1">İşlem</label>
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="w-full h-[42px] px-2 bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors flex items-center justify-center"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
