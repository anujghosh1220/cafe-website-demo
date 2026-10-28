import { useCart } from './CartContext'

export default function Cart() {
  const { cart, updateQty, remove, clear, total } = useCart()
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-cream text-mocha flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="font-serif text-3xl mb-4">Your cart is empty</h1>
          <a href="/#menu" className="bg-amber text-white px-6 py-3 rounded-full">Return to menu</a>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-cream text-mocha p-6">
      <a href="/#menu" className="inline-block mb-4 text-mocha/70 hover:text-mocha">← Back to Menu</a>
      <h1 className="font-serif text-3xl mb-6">Cart</h1>
      <div className="space-y-4">
        {cart.map((i: any) => (
          <div key={i.id} className="bg-white rounded-2xl p-4 shadow flex gap-4 items-center">
            <img src={i.image} alt={i.name} className="w-20 h-20 object-cover rounded-xl" />
            <div className="flex-1">
              <h3 className="font-serif text-xl">{i.name}</h3>
              <p className="text-sm text-mocha/70">{i.description}</p>
              <p className="text-amber font-semibold">₹{i.price}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQty(i.id, i.qty - 1)} className="px-2 py-1 border rounded">-</button>
              <span>{i.qty}</span>
              <button onClick={() => updateQty(i.id, i.qty + 1)} className="px-2 py-1 border rounded">+</button>
            </div>
            <p className="font-semibold">₹{i.price * i.qty}</p>
            <button onClick={() => remove(i.id)} className="text-red-600 text-sm">Remove</button>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-between items-center">
        <p className="text-xl font-semibold">Total: ₹{total}</p>
        <div className="flex gap-2">
          <button onClick={() => { if (confirm('Clear cart?')) clear() }} className="px-4 py-2 rounded-full border">Clear</button>
          <a href="/checkout" className="bg-amber text-white px-6 py-2 rounded-full">Checkout</a>
        </div>
      </div>
    </div>
  )
}
