'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('agent_shop_cart');
    if (saved) {
      try { setCart(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('agent_shop_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, color = null) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id && item.color === color);
      if (existing) {
        return prev.map(item => 
          item._id === product._id && item.color === color 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, color }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId, color = null) => {
    setCart(prev => prev.filter(item => !(item._id === productId && item.color === color)));
  };

  const updateQuantity = (productId, color, newQuantity) => {
    if (newQuantity < 1) return removeFromCart(productId, color);
    setCart(prev => prev.map(item => 
      item._id === productId && item.color === color 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => {
    const price = item.isDeal ? item.price * (1 - item.discountPercentage / 100) : item.price;
    return total + (price * item.quantity);
  }, 0);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, cartCount, isCartOpen, setIsCartOpen 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
