import { useState } from "react";
import { inputStyle } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { Btn, Card, Field } from "@/components/ui";

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
      <Field label="Nombre"><input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Categoría">
          <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {["Vacunas", "Medicamentos", "Alimentos", "Estética", "Otros"].map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
        <Field label="Precio de venta"><input type="number" style={inputStyle} value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value || 0 })} /></Field>
        {!isEdit && <Field label="Stock inicial"><input type="number" style={inputStyle} value={stock} onChange={(e) => setStock(+e.target.value || 0)} /></Field>}
        <Field label="Stock mínimo"><input type="number" style={inputStyle} value={form.minStock} onChange={(e) => setForm({ ...form, minStock: +e.target.value || 0 })} /></Field>
      </div>
      <Field label="Fecha de caducidad"><input type="date" style={inputStyle} value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} /></Field>
      <div className="flex justify-end gap-2 mt-1">
        <Btn kind="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn disabled={!form.name} onClick={() => onSubmit(form, stock)}>{submitLabel}</Btn>
      </div>
    </Card>
  );
}
