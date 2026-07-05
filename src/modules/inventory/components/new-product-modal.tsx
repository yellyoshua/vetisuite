import { useState } from "react";
import { inputStyle } from "../../../lib/constants";
import { useVetStore } from "../../../states/app.state";
import { Btn, Field, Modal } from "../../../components/ui";

export function NewProductModal({ onClose }: { onClose: () => void }) {
  const addProduct = useVetStore((s) => s.addProduct);
  const [form, setForm] = useState({ name: "", category: "Medicamentos", stock: 0, minStock: 5, price: 0, expiry: "2027-01-01" });
  return (
    <Modal title="Nuevo producto" onClose={onClose}>
      <Field label="Nombre"><input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Categoría">
          <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {["Vacunas", "Medicamentos", "Alimentos", "Estética", "Otros"].map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
        <Field label="Precio de venta"><input type="number" style={inputStyle} value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value || 0 })} /></Field>
        <Field label="Stock inicial"><input type="number" style={inputStyle} value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value || 0 })} /></Field>
        <Field label="Stock mínimo"><input type="number" style={inputStyle} value={form.minStock} onChange={(e) => setForm({ ...form, minStock: +e.target.value || 0 })} /></Field>
      </div>
      <Field label="Fecha de caducidad"><input type="date" style={inputStyle} value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} /></Field>
      <Btn full disabled={!form.name} onClick={() => { addProduct(form); onClose(); }}>Ingresar producto</Btn>
    </Modal>
  );
}
