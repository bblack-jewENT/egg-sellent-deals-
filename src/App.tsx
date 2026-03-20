import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Search,
  Clock,
  Star,
  Truck,
  Package,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ArrowRight,
  X,
} from "lucide-react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
const eggsImg = "/img/eggs.jpeg";
const meatyBonesImg = "/img/meaty-bones.jpeg";
const iphone17ProMaxImg = "/img/Apple-iPhone-17-Pro-Max.webp";
const iphone17LavenderImg = "/img/iphone_17_lavender.webp";
const iphone16ProMaxImg = "/img/iphone_16_pro_max.webp";
const iphone16Img = "/img/iPhone_16.jpg";
const iphone15ProMaxImg = "/img/IPHONE15pro-max.webp";
const iphone15Img = "/img/iphone_15.webp";
const iphone14ProMaxImg = "/img/iPhone14ProMax.webp";
const iphone14Img = "/img/iPhone-14.webp";
const iphone13ProGreenImg = "/img/iphone13ProGreen.webp";
const iphone13MidnightImg = "/img/iPhone_13_Midnight.jpg";
const iphone12ProMaxImg = "/img/iPhone_12_Pro_Max.webp";
const iphone12Img = "/img/iphone-12.jpg";
const iphone11ProMaxImg = "/img/iPhone-11-Pro-Max.jpg";
const iphone11BlackImg = "/img/iPhone_11_black.webp";

// Product data
const products = [
  {
    id: 1,
    name: "Farm Fresh Eggs (Tray of 30)",
    price: 90,
    currency: "R",
    description:
      "Large, fresh eggs straight from the farm. Perfect for baking and breakfast.",
    image: eggsImg,
    quantity: 0,
  },
  {
    id: 2,
    name: "Meaty Beef Bones (Bulk Bag)",
    price: 150,
    currency: "R",
    description:
      "High-quality meaty bones, great for making rich soups and stews.",
    image: meatyBonesImg,
    quantity: 0,
  },
  {
    id: 3,
    name: "iPhone",
    price: "Price on Order",
    description:
      "Brand new iPhone. Easy to use, great camera to take pictures of the grandchildren.",
    image:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800",
    quantity: 0,
  },
];

// iPhone variants with pricing, availability, and images
const iphoneVariants = [
  {
    id: 1,
    name: "iPhone 17 Pro Max",
    available: true,
    image: iphone17ProMaxImg,
  },
  {
    id: 2,
    name: "iPhone 17 Pro",
    available: true,
    image: iphone17ProMaxImg,
  },
  {
    id: 3,
    name: "iPhone 17",
    available: false,
    image: iphone17LavenderImg,
  },
  {
    id: 4,
    name: "iPhone 16 Pro Max",
    available: true,
    image: iphone16ProMaxImg,
  },
  {
    id: 5,
    name: "iPhone 16 Pro",
    available: true,
    image: iphone16ProMaxImg,
  },
  {
    id: 6,
    name: "iPhone 16",
    available: false,
    image: iphone16Img,
  },
  {
    id: 7,
    name: "iPhone 15 Pro Max",
    available: true,
    image: iphone15ProMaxImg,
  },
  {
    id: 8,
    name: "iPhone 15 Pro",
    available: true,
    image: iphone15ProMaxImg,
  },
  {
    id: 9,
    name: "iPhone 15",
    available: true,
    image: iphone15Img,
  },
  {
    id: 10,
    name: "iPhone 14 Pro Max",
    available: true,
    image: iphone14ProMaxImg,
  },
  {
    id: 11,
    name: "iPhone 14 Pro",
    available: false,
    image: iphone14ProMaxImg,
  },
  {
    id: 12,
    name: "iPhone 14 (128GB)",
    available: true,
    image: iphone14Img,
  },
  {
    id: 13,
    name: "iPhone 14 (256GB)",
    available: false,
    image: iphone14Img,
  },
  {
    id: 14,
    name: "iPhone 13 Pro Max",
    available: true,
    image: iphone13ProGreenImg,
  },
  {
    id: 15,
    name: "iPhone 13 Pro",
    available: true,
    image: iphone13ProGreenImg,
  },
  {
    id: 16,
    name: "iPhone 13",
    available: true,
    image: iphone13MidnightImg,
  },
  {
    id: 17,
    name: "iPhone 12 Pro Max",
    available: false,
    image: iphone12ProMaxImg,
  },
  {
    id: 18,
    name: "iPhone 12 Pro",
    available: true,
    image: iphone12ProMaxImg,
  },
  {
    id: 19,
    name: "iPhone 12",
    available: true,
    image: iphone12Img,
  },
  {
    id: 20,
    name: "iPhone 11 Pro Max",
    available: true,
    image: iphone11ProMaxImg,
  },
  {
    id: 21,
    name: "iPhone 11 Pro",
    available: false,
    image: iphone11ProMaxImg,
  },
  {
    id: 22,
    name: "iPhone 11",
    available: true,
    image: iphone11BlackImg,
  },
];

// Meaty bones variants
const meatyBonesVariants = [
  { id: 1, weight: "4kg", price: 210, available: true },
  { id: 2, weight: "5kg", price: 250, available: true },
];
// Eggs variants
const eggsVariants = [
  { id: 1, label: "1 Tray of 30", price: 75, available: true },
  { id: 2, label: "12 Trays of 30", price: 800, available: true },
];
type Product = (typeof products)[0];
type CartItem = { product: Product; quantity: number };
type DeliveryOption = "standard" | "express";
type OrderStatus = "Processing" | "Shipped" | "Delivered";
type Order = {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  deliveryCost: number;
  total: number;
  delivery: DeliveryOption;
  status: OrderStatus;
};
type Review = { id: string; rating: number; comment: string; date: string };
type ViewState = "shop" | "cart" | "success" | "orders";

const DELIVERY_COSTS = {
  standard: 50,
  express: 150,
};

export default function App() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [view, setView] = useState<ViewState>("shop");
  const [searchQuery, setSearchQuery] = useState("");
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [email, setEmail] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryOption>("standard");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Record<number, Review[]>>({});
  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);
  const [newReview, setNewReview] = useState<{
    rating: number;
    comment: string;
  }>({ rating: 5, comment: "" });
  const [selectedIphoneVariant, setSelectedIphoneVariant] =
    useState<number>(12); // Default to iPhone 14 (128GB)
  const [selectedMeatyBonesVariant, setSelectedMeatyBonesVariant] =
    useState<number>(1); // Default to 4kg
  const [selectedEggsVariant, setSelectedEggsVariant] = useState<number>(1); // Default to 1 Tray of 30

  useEffect(() => {
    const savedOrders = localStorage.getItem("pastOrders");
    if (savedOrders) {
      try {
        setPastOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error(e);
      }
    }
    const savedReviews = localStorage.getItem("productReviews");
    if (savedReviews) {
      try {
        setReviews(JSON.parse(savedReviews));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const clearCart = () => {
    setCart([]);
  };

  const addToCart = (product: Product) => {
    // For iPhone, use selected variant details
    let cartProduct = product;
    if (product.id === 3) {
      const selectedVariant = iphoneVariants.find(
        (v) => v.id === selectedIphoneVariant,
      );
      if (selectedVariant) {
        cartProduct = {
          ...product,
          name: selectedVariant.name,
          price: selectedVariant.price,
        };
      }
    }

    // For Meaty Bones, attach selected weight and price
    if (product.id === 2) {
      const selectedVariant = meatyBonesVariants.find(
        (v) => v.id === selectedMeatyBonesVariant,
      );
      if (selectedVariant) {
        cartProduct = {
          ...product,
          name: `${product.name} (${selectedVariant.weight})`,
          price: selectedVariant.price,
        };
      }
    }

    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.product.id === cartProduct.id &&
          item.product.name === cartProduct.name,
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === cartProduct.id &&
          item.product.name === cartProduct.name
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product: cartProduct, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      }),
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const deliveryCost = DELIVERY_COSTS[delivery];
  const total = subtotal + deliveryCost;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const initiateCheckout = () => {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address so we can send your receipt.");
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleCheckout = async () => {
    setShowConfirmDialog(false);
    setIsCheckingOut(true);

    try {
      const newOrder: Order = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        items: [...cart],
        subtotal,
        deliveryCost,
        total,
        delivery,
        status: "Processing",
      };
      const updatedOrders = [newOrder, ...pastOrders];
      setPastOrders(updatedOrders);
      localStorage.setItem("pastOrders", JSON.stringify(updatedOrders));

      // Send email via Firebase Trigger Email extension
      let htmlContent = `<h1>Thank you for your order!</h1><p>Your order total is R${total} (including R${deliveryCost} for ${delivery} delivery).</p><ul>`;
      cart.forEach((item) => {
        htmlContent += `<li>${item.quantity}x ${item.product.name} - R${item.product.price * item.quantity}</li>`;
      });
      htmlContent += `</ul>`;

      await addDoc(collection(db, "mail"), {
        to: email,
        message: {
          subject: "Your Order Confirmation - EGG-SELLENT DEALS!",
          html: htmlContent,
        },
        createdAt: new Date(),
      });

      clearCart();
      setEmail("");
      setView("success");
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error placing order:", error);
      alert("There was an error placing your order. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updatedOrders = pastOrders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o,
    );
    setPastOrders(updatedOrders);
    localStorage.setItem("pastOrders", JSON.stringify(updatedOrders));
  };

  const handleAddReview = (productId: number) => {
    if (!newReview.comment.trim()) return;
    const review: Review = {
      id: Date.now().toString(),
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toLocaleDateString(),
    };
    const updatedReviews = {
      ...reviews,
      [productId]: [review, ...(reviews[productId] || [])],
    };
    setReviews(updatedReviews);
    localStorage.setItem("productReviews", JSON.stringify(updatedReviews));
    setNewReview({ rating: 5, comment: "" });
  };

  const getAvgRating = (productId: number) => {
    const prodReviews = reviews[productId] || [];
    if (prodReviews.length === 0) return 0;
    return (
      prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length
    ).toFixed(1);
  };

  const toggleReviews = (productId: number) => {
    setExpandedReviews((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "Processing":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-zinc-100 text-zinc-800 border-zinc-200";
    }
  };

  if (view === "success") {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-zinc-200 max-w-lg w-full">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle
              className="w-10 h-10 text-emerald-600"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-4 tracking-tight">
            Order Confirmed
          </h1>
          <p className="text-zinc-500 mb-8">
            Thank you for shopping with us! Your order has been placed
            successfully and we'll be in touch shortly.
          </p>
          <button
            onClick={() => setView("shop")}
            className="w-full bg-zinc-900 text-white text-base font-medium py-3 px-6 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans flex flex-col text-zinc-900">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            EGG-SELLENT DEALS!
          </h1>
          <nav className="flex items-center gap-2" aria-label="Main navigation">
            <button
              onClick={() => setView("orders")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${view === "orders" ? "bg-zinc-100 text-zinc-900" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"}`}
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Past Orders</span>
            </button>
            <button
              onClick={() => setView("cart")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${view === "cart" ? "bg-indigo-600 text-white shadow-sm" : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm"}`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Cart</span>
              {totalItems > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {totalItems}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 flex-grow w-full">
        {view === "cart" && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
                Shopping Cart
              </h2>
              <div className="flex items-center gap-3">
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-sm font-medium text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Clear Cart
                  </button>
                )}
                <button
                  onClick={() => setView("shop")}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 px-3 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-zinc-300" />
                </div>
                <p className="text-lg text-zinc-500 mb-6">
                  Your cart is currently empty.
                </p>
                <button
                  onClick={() => setView("shop")}
                  className="bg-zinc-900 text-white text-sm font-medium py-2.5 px-6 rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
                    <ul className="divide-y divide-zinc-100">
                      {cart.map((item) => (
                        <li
                          key={item.product.id}
                          className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-24 h-24 object-cover rounded-2xl bg-zinc-50"
                          />
                          <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-base font-semibold text-zinc-900 mb-1">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-zinc-500 mb-4 sm:mb-0">
                              {item.product.currency}
                              {item.product.price} each
                            </p>
                          </div>

                          <div className="flex items-center gap-4 sm:gap-6">
                            <div className="flex items-center bg-zinc-50 rounded-full border border-zinc-200 p-1">
                              <button
                                onClick={() =>
                                  updateQuantity(item.product.id, -1)
                                }
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-zinc-600 transition-all"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.product.id, 1)
                                }
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-zinc-600 transition-all"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="w-20 text-right font-semibold text-zinc-900">
                              {item.product.currency}
                              {item.product.price * item.quantity}
                            </div>

                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Delivery Options */}
                  <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                      Delivery Method
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label
                        className={`relative flex cursor-pointer rounded-2xl border p-4 focus:outline-none transition-all ${delivery === "standard" ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200" : "border-zinc-200 bg-white hover:border-zinc-300"}`}
                      >
                        <input
                          type="radio"
                          name="delivery"
                          value="standard"
                          checked={delivery === "standard"}
                          onChange={() => setDelivery("standard")}
                          className="sr-only"
                        />
                        <span className="flex flex-1">
                          <span className="flex flex-col">
                            <span
                              className={`block text-sm font-medium ${delivery === "standard" ? "text-indigo-900" : "text-zinc-900"}`}
                            >
                              Standard Delivery
                            </span>
                            <span
                              className={`mt-1 flex items-center text-sm ${delivery === "standard" ? "text-indigo-700" : "text-zinc-500"}`}
                            >
                              3-5 Days &bull; R50
                            </span>
                          </span>
                        </span>
                        <Truck
                          className={`h-5 w-5 ${delivery === "standard" ? "text-indigo-600" : "text-zinc-400"}`}
                        />
                      </label>
                      <label
                        className={`relative flex cursor-pointer rounded-2xl border p-4 focus:outline-none transition-all ${delivery === "express" ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200" : "border-zinc-200 bg-white hover:border-zinc-300"}`}
                      >
                        <input
                          type="radio"
                          name="delivery"
                          value="express"
                          checked={delivery === "express"}
                          onChange={() => setDelivery("express")}
                          className="sr-only"
                        />
                        <span className="flex flex-1">
                          <span className="flex flex-col">
                            <span
                              className={`block text-sm font-medium ${delivery === "express" ? "text-indigo-900" : "text-zinc-900"}`}
                            >
                              Express Delivery
                            </span>
                            <span
                              className={`mt-1 flex items-center text-sm ${delivery === "express" ? "text-indigo-700" : "text-zinc-500"}`}
                            >
                              1-2 Days &bull; R150
                            </span>
                          </span>
                        </span>
                        <Package
                          className={`h-5 w-5 ${delivery === "express" ? "text-indigo-600" : "text-zinc-400"}`}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm sticky top-24">
                    <h3 className="text-lg font-semibold text-zinc-900 mb-6">
                      Order Summary
                    </h3>

                    <div className="space-y-4 text-sm text-zinc-600 mb-6">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-medium text-zinc-900">
                          R{subtotal}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery ({delivery})</span>
                        <span className="font-medium text-zinc-900">
                          R{deliveryCost}
                        </span>
                      </div>
                      <div className="flex justify-between pt-4 border-t border-zinc-100 text-base font-semibold text-zinc-900">
                        <span>Total to Pay</span>
                        <span className="text-lg text-indigo-600">
                          R{total}
                        </span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-zinc-700 mb-2"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="For your receipt"
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                      />
                    </div>

                    <button
                      onClick={initiateCheckout}
                      disabled={isCheckingOut || cart.length === 0}
                      className="w-full bg-indigo-600 text-white text-base font-medium py-3 px-4 rounded-xl shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                      Review Order <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {view === "orders" && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
                Past Orders
              </h2>
              <button
                onClick={() => setView("shop")}
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 px-3 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                Back to Shop
              </button>
            </div>

            {pastOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-zinc-300" />
                </div>
                <p className="text-lg text-zinc-500 mb-6">
                  You have no past orders yet.
                </p>
                <button
                  onClick={() => setView("shop")}
                  className="bg-zinc-900 text-white text-sm font-medium py-2.5 px-6 rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {pastOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm"
                  >
                    <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-200 flex flex-wrap justify-between items-center gap-4">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">
                            Order Placed
                          </p>
                          <p className="text-sm font-medium text-zinc-900">
                            {order.date}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">
                            Total
                          </p>
                          <p className="text-sm font-medium text-zinc-900">
                            R{order.total}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(
                              order.id,
                              e.target.value as OrderStatus,
                            )
                          }
                          className="text-xs p-1.5 border border-zinc-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-600"
                        >
                          <option value="Processing">Set: Processing</option>
                          <option value="Shipped">Set: Shipped</option>
                          <option value="Delivered">Set: Delivered</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-6">
                      <ul className="divide-y divide-zinc-100">
                        {order.items.map((item, idx) => (
                          <li
                            key={idx}
                            className="py-4 first:pt-0 last:pb-0 flex items-center gap-4"
                          >
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-xl bg-zinc-50"
                            />
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-zinc-900">
                                {item.product.name}
                              </h4>
                              <p className="text-sm text-zinc-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <div className="text-sm font-medium text-zinc-900">
                              R{item.product.price * item.quantity}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "shop" && (
          <div className="animate-in fade-in duration-300">
            <section className="mb-12 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 mb-4 tracking-tight">
                Fresh deals, delivered.
              </h2>
              <p className="text-lg text-zinc-500 mb-8">
                Shop our curated selection of farm-fresh produce and premium
                electronics.
              </p>

              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <input
                  type="search"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-zinc-200 rounded-full text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all text-base"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </section>

            <section>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200 shadow-sm">
                  <p className="text-lg text-zinc-500 mb-4">
                    No products found matching "{searchQuery}".
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {filteredProducts.map((product) => {
                    const avgRating = getAvgRating(product.id);
                    const prodReviews = reviews[product.id] || [];
                    const isExpanded = expandedReviews.includes(product.id);

                    return (
                      <article
                        key={product.id}
                        className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                      >
                        <div className="aspect-[4/3] relative bg-zinc-100 overflow-hidden group">
                          <img
                            src={
                              product.id === 3
                                ? iphoneVariants.find(
                                    (v) => v.id === selectedIphoneVariant,
                                  )?.image || product.image
                                : product.image
                            }
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                          <div className="flex justify-between items-start mb-2 gap-4">
                            <h3 className="text-lg font-semibold text-zinc-900 leading-tight">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 shrink-0">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span className="text-xs font-semibold text-amber-700">
                                {avgRating || "New"}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-zinc-500 mb-6 flex-grow line-clamp-3">
                            {product.description}
                          </p>

                          {/* iPhone Model Selector */}
                          {product.id === 3 && (
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Select Model:
                              </label>
                              <div className="relative">
                                <select
                                  value={selectedIphoneVariant}
                                  onChange={(e) =>
                                    setSelectedIphoneVariant(
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 appearance-none cursor-pointer hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                >
                                  {iphoneVariants.map((variant) => (
                                    <option key={variant.id} value={variant.id}>
                                      {variant.name} - {variant.price}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                {iphoneVariants.find(
                                  (v) => v.id === selectedIphoneVariant,
                                )?.available ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    <span className="text-sm font-semibold text-emerald-600">
                                      Available
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <X className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-semibold text-red-600">
                                      Out of Stock
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Eggs Package Selector */}
                          {product.id === 1 && (
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Select Package:
                              </label>
                              <div className="relative">
                                <select
                                  value={selectedEggsVariant}
                                  onChange={(e) =>
                                    setSelectedEggsVariant(
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 appearance-none cursor-pointer hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                >
                                  {eggsVariants.map((variant) => (
                                    <option key={variant.id} value={variant.id}>
                                      {variant.label} - R{variant.price}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                {eggsVariants.find(
                                  (v) => v.id === selectedEggsVariant,
                                )?.available ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    <span className="text-sm font-semibold text-emerald-600">
                                      Available
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <X className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-semibold text-red-600">
                                      Out of Stock
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Meaty Bones Size Selector */}
                          {product.id === 2 && (
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Select Size:
                              </label>
                              <div className="relative">
                                <select
                                  value={selectedMeatyBonesVariant}
                                  onChange={(e) =>
                                    setSelectedMeatyBonesVariant(
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 appearance-none cursor-pointer hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                >
                                  {meatyBonesVariants.map((variant) => (
                                    <option key={variant.id} value={variant.id}>
                                      {variant.weight} - R{variant.price}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                {meatyBonesVariants.find(
                                  (v) => v.id === selectedMeatyBonesVariant,
                                )?.available ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    <span className="text-sm font-semibold text-emerald-600">
                                      Available
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <X className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-semibold text-red-600">
                                      Out of Stock
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100 mb-4">
                            <span className="text-2xl font-bold text-zinc-900">
                              {product.currency}
                              {product.id === 3
                                ? iphoneVariants.find(
                                    (v) => v.id === selectedIphoneVariant,
                                  )?.price || product.price
                                : product.id === 2
                                  ? meatyBonesVariants.find(
                                      (v) => v.id === selectedMeatyBonesVariant,
                                    )?.price || product.price
                                  : product.id === 1
                                    ? eggsVariants.find(
                                        (v) => v.id === selectedEggsVariant,
                                      )?.price || product.price
                                    : product.price}
                            </span>
                            <button
                              onClick={() => addToCart(product)}
                              className="flex items-center justify-center w-10 h-10 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900"
                              aria-label="Add to cart"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>

                          <button
                            onClick={() => toggleReviews(product.id)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 text-sm font-medium rounded-xl transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                            {isExpanded
                              ? "Hide Reviews"
                              : `Reviews (${prodReviews.length})`}
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Reviews Section */}
                        {isExpanded && (
                          <div className="px-6 pb-6 bg-zinc-50 border-t border-zinc-200">
                            <div className="pt-4 space-y-3 mb-6 max-h-48 overflow-y-auto pr-2">
                              {prodReviews.length === 0 ? (
                                <p className="text-zinc-500 text-sm italic text-center py-2">
                                  No reviews yet. Be the first!
                                </p>
                              ) : (
                                prodReviews.map((review) => (
                                  <div
                                    key={review.id}
                                    className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-sm"
                                  >
                                    <div className="flex justify-between items-center mb-1.5">
                                      <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star
                                            key={star}
                                            className={`w-3.5 h-3.5 ${star <= review.rating ? "text-amber-400 fill-amber-400" : "text-zinc-200"}`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-xs text-zinc-400">
                                        {review.date}
                                      </span>
                                    </div>
                                    <p className="text-sm text-zinc-700">
                                      {review.comment}
                                    </p>
                                  </div>
                                ))
                              )}
                            </div>

                            <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                              <h5 className="text-sm font-semibold text-zinc-900 mb-3">
                                Write a Review
                              </h5>
                              <div className="mb-3">
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      onClick={() =>
                                        setNewReview({
                                          ...newReview,
                                          rating: star,
                                        })
                                      }
                                      className="focus:outline-none hover:scale-110 transition-transform p-1"
                                    >
                                      <Star
                                        className={`w-6 h-6 ${star <= newReview.rating ? "text-amber-400 fill-amber-400" : "text-zinc-200"}`}
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <textarea
                                rows={2}
                                value={newReview.comment}
                                onChange={(e) =>
                                  setNewReview({
                                    ...newReview,
                                    comment: e.target.value,
                                  })
                                }
                                className="w-full p-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm resize-none mb-3 bg-zinc-50"
                                placeholder="Share your thoughts..."
                              />
                              <button
                                onClick={() => handleAddReview(product.id)}
                                disabled={!newReview.comment.trim()}
                                className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                              >
                                Submit Review
                              </button>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-zinc-900">
                  Confirm Order
                </h3>
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-8 text-sm text-zinc-700">
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                  <p className="mb-1">
                    <span className="text-zinc-500">Email:</span>{" "}
                    <span className="font-medium text-zinc-900">{email}</span>
                  </p>
                  <p>
                    <span className="text-zinc-500">Delivery:</span>{" "}
                    <span className="font-medium text-zinc-900">
                      {delivery === "express"
                        ? "Express (1-2 Days)"
                        : "Standard (3-5 Days)"}
                    </span>
                  </p>
                </div>

                <div className="max-h-48 overflow-y-auto pr-2 space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-0"
                    >
                      <span className="flex-1 pr-4 truncate">
                        <span className="font-medium text-zinc-900">
                          {item.quantity}x
                        </span>{" "}
                        {item.product.name}
                      </span>
                      <span className="font-medium text-zinc-900">
                        R{item.product.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mt-4">
                  <div className="flex justify-between mb-1 text-indigo-900/70">
                    <span>Subtotal</span>
                    <span>R{subtotal}</span>
                  </div>
                  <div className="flex justify-between mb-3 text-indigo-900/70">
                    <span>Delivery</span>
                    <span>R{deliveryCost}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-indigo-900 border-t border-indigo-200/50 pt-2">
                    <span>Total</span>
                    <span>R{total}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={isCheckingOut}
                  className="flex-1 py-3 px-4 rounded-xl font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {isCheckingOut ? "Processing..." : "Confirm & Pay"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 text-zinc-900">
            <Package className="w-5 h-5 text-indigo-600" />
            <span className="text-lg font-bold tracking-tight">
              EGG-SELLENT DEALS!
            </span>
          </div>
          <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
            Providing the best farm fresh eggs, meaty bones, and tech for you.
          </p>
          <p className="text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} EGG-SELLENT DEALS! by bblack-jew
            ENTj All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
