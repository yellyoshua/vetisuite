import { useState } from "react";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { Btn, Card, DateInput, Field, Input, Select } from "@/components/ui";

type ProductFormData = Omit<Product, "id" | "stock">;

/* Shared by the new and edit screens. Stock is only set at creation;
   afterwards it only changes via restock batches or clinical usage. */
interface ProductFormProps {
  initial?: ProductFormData;
  submitLabel: string;
  onSubmit: (data: ProductFormData, initialStock: number) => void;
  onCancel: () => void;
}

export function ProductForm({ initial, submitLabel, onSubmit, onCancel }: ProductFormProps) {
  const isEdit = !!initial;
  const [form, setForm] = useState<ProductFormData>(initial || { name: "", category: "Medicamentos", minStock: 5, price: 0, expiry: "2027-01-01" });
  const [stock, setStock] = useState(0);
  return (
    <Card className="p-5">
      <Field label="Nombre"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Categoría">
          <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {PRODUCT_CATEGORIES.map((x) => <option key={x}>{x}</option>)}
          </Select>
        </Field>
        <Field label="Precio de venta"><Input type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Math.max(0, +e.target.value || 0) })} /></Field>
        {!isEdit && <Field label="Stock inicial"><Input type="number" min={0} value={stock} onChange={(e) => setStock(Math.max(0, +e.target.value || 0))} /></Field>}
        <Field label="Stock mínimo"><Input type="number" min={0} value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Math.max(0, +e.target.value || 0) })} /></Field>
      </div>
      <Field label="Fecha de caducidad"><DateInput value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} /></Field>
      <div className="flex justify-end gap-2 mt-1">
        <Btn kind="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn disabled={!form.name} onClick={() => onSubmit(form, stock)}>{submitLabel}</Btn>
      </div>
    </Card>
  );
}
