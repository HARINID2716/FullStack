import { useCart } from "../context/CartContext";

const CartPage = () => {
  const { cartItems, addToCart, removeFromCart, deleteItem, totalAmount } =
    useCart();

  if (cartItems.length === 0) {
    return <h2 className="text-center mt-32">Cart is Empty 🛒</h2>;
  }

  return (
    <div className="max-w-4xl mx-auto pt-32 px-6">
      <h2 className="text-2xl font-bold mb-6">Your Cart</h2>

      {cartItems.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center bg-white p-4 mb-4 rounded shadow"
        >
          <div>
            <h3 className="font-semibold">{item.name}</h3>
            <p>₹ {item.price} × {item.qty}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => removeFromCart(item.id)}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              −
            </button>

            <button
              onClick={() => addToCart(item)}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              +
            </button>

            <button
              onClick={() => deleteItem(item.id)}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <h3 className="text-xl font-bold text-right mt-6">
        Total: ₹ {totalAmount}
      </h3>
    </div>
  );
};

export default CartPage;
