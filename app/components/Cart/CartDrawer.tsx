// app/components/Cart/CartDrawer.tsx
"use client";

import { X, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/app/context/CartContext";

export default function CartDrawer() {
  const { cart, isOpen, pending, closeCart, removeLine, updateLine } = useCart();

  const formatPrice = (amount: string, currencyCode: string) => new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(parseFloat(amount));

  const lines = cart?.lines ?? [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="fixed inset-0 z-40 bg-black/60" onClick={closeCart} aria-hidden="true" />

          {/* Drawer panel */}
          <motion.div key="drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.9 }} className="fixed right-0 top-0 z-50 h-full w-full max-w-105 bg-[#0b0b0b] flex flex-col" role="dialog" aria-modal="true" aria-label="Shopping cart">
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 shrink-0 border-b border-white/10">
              <span className="text-xs tracking-[0.22em] uppercase text-white">Cart</span>
              <button onClick={closeCart} aria-label="Close cart" className="text-white/50 hover:text-white transition-colors">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Item list */}
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
              {lines.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4 text-white/30">
                    <ShoppingCart size={32} strokeWidth={1} />
                    <span className="text-xs tracking-[0.22em] uppercase">Your cart is empty</span>
                  </div>
                </div>
              ) : (
                lines.map((line) => (
                  <div key={line.id} className="flex gap-4">
                    {/* Image */}
                    <div className="w-16 h-16 shrink-0 bg-white/5 rounded flex items-center justify-center">
                      {line.merchandise.product.featuredImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={line.merchandise.product.featuredImage.url} alt={line.merchandise.product.featuredImage.altText ?? line.merchandise.product.title} className="w-full h-full object-cover rounded" />
                      ) : (
                        <ShoppingCart size={18} strokeWidth={1} className="text-white/20" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col gap-1.5">
                      <p className="text-xs tracking-[0.14em] uppercase text-white leading-snug">{line.merchandise.product.title}</p>
                      <p className="text-[0.65rem] tracking-[0.14em] text-white/40 uppercase">{line.merchandise.title}</p>
                      <p className="text-xs text-white/60">{formatPrice(line.merchandise.price.amount, line.merchandise.price.currencyCode)}</p>

                      {/* Quantity + Remove */}
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateLine(line.id, line.quantity - 1)} aria-label="Decrease quantity" disabled={pending || line.quantity === 1} className="text-white/40 hover:text-white transition-colors text-sm leading-none disabled:opacity-30 disabled:cursor-not-allowed">
                            −
                          </button>
                          <span className="text-xs text-white/70 tabular-nums">{line.quantity}</span>
                          <button onClick={() => updateLine(line.id, line.quantity + 1)} aria-label="Increase quantity" disabled={pending} className="text-white/40 hover:text-white transition-colors text-sm leading-none disabled:opacity-30 disabled:cursor-not-allowed">
                            +
                          </button>
                        </div>
                        <button onClick={() => removeLine(line.id)} aria-label={`Remove ${line.merchandise.product.title} from cart`} disabled={pending} className="text-[0.65rem] tracking-[0.14em] uppercase text-white/30 hover:text-white/70 transition-colors underline underline-offset-2 disabled:opacity-30 disabled:cursor-not-allowed">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart && lines.length > 0 && (
              <div className="shrink-0 border-t border-white/10 px-6 py-6 flex flex-col gap-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs tracking-[0.22em] uppercase text-white/60">Subtotal</span>
                  <span className="text-sm tracking-widest text-white">{formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}</span>
                </div>
                <p className="text-[0.65rem] tracking-widest text-white/30 uppercase">Taxes and shipping calculated at checkout</p>
                <a href={cart.checkoutUrl} className="w-full bg-white text-black text-xs tracking-[0.22em] uppercase text-center py-4 hover:bg-white/90 transition-colors">
                  Check Out
                </a>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
