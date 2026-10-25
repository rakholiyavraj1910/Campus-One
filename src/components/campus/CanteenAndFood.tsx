import React, { useState } from 'react';
import { Coffee, Clock, Utensils, Sparkles, Check, Heart, ShieldCheck } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const CanteenAndFood: React.FC = () => {
  const [selectedMeal, setSelectedMeal] = useState<'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner'>('Lunch');
  const [orderedTokens, setOrderedTokens] = useState<string[]>([]);
  const { addNotification } = useNotifications();

  const mealMenus: Record<string, Array<{ name: string; price: string; calories: string; isVeg: boolean; desc: string }>> = {
    Breakfast: [
      { name: 'South Indian Masala Dosa with Sambar & Chutneys', price: '₹45', calories: '320 kcal', isVeg: true, desc: 'Crispy fermented crepe stuffed with spiced potato mash.' },
      { name: 'Steamed Idli Vada Combo', price: '₹40', calories: '260 kcal', isVeg: true, desc: 'Two fluffy rice cakes with one crispy medu vada and hot rasam.' },
      { name: 'Poha & Masala Chai Combo', price: '₹35', calories: '220 kcal', isVeg: true, desc: 'Flattened rice tossed with roasted peanuts, curry leaves, and ginger tea.' }
    ],
    Lunch: [
      { name: 'Special North Indian Deluxe Thali', price: '₹90', calories: '650 kcal', isVeg: true, desc: 'Paneer butter masala, dal makhani, 3 rotis, jeera rice, salad & gulab jamun.' },
      { name: 'South Indian Unlimited Meals Thali', price: '₹75', calories: '580 kcal', isVeg: true, desc: 'Steamed rice, sambar, rasam, kootu, poriyal, curd & appalam.' },
      { name: 'Hyderabadi Veg Dum Biryani with Raita', price: '₹85', calories: '510 kcal', isVeg: true, desc: 'Long-grain basmati rice cooked on dum with seasonal vegetables and saffron.' },
      { name: 'Healthy Protein Quinoa Salad Bowl', price: '₹70', calories: '310 kcal', isVeg: true, desc: 'Sprouted beans, fresh greens, cherry tomatoes, and lemon-herb vinaigrette.' }
    ],
    Snacks: [
      { name: 'Grilled Veg Cheese Sandwich', price: '₹50', calories: '340 kcal', isVeg: true, desc: 'Crispy toasted sandwich with bell peppers, corn, and mozzarella.' },
      { name: 'Samosa Chaat with Tangy Chutneys', price: '₹35', calories: '290 kcal', isVeg: true, desc: 'Crushed crisp samosas topped with spiced chickpeas, yogurt, and sev.' },
      { name: 'Artisan Cappuccino / Cold Coffee', price: '₹30', calories: '140 kcal', isVeg: true, desc: 'Brewed with 100% Arabica beans from Chikmagalur.' }
    ],
    Dinner: [
      { name: 'Paneer Bhurji with 3 Butter Phulkas', price: '₹85', calories: '520 kcal', isVeg: true, desc: 'Crumbled cottage cheese sautéed with onions, green chilies, and herbs.' },
      { name: 'Dal Tadka & Steamed Basmati Rice', price: '₹65', calories: '420 kcal', isVeg: true, desc: 'Yellow lentils tempered with cumin, garlic, and ghee.' },
      { name: 'Mixed Veg Fried Rice with Manchurian', price: '₹80', calories: '560 kcal', isVeg: true, desc: 'Wok-tossed Indo-Chinese rice served with vegetable dumplings in gravy.' }
    ]
  };

  const handleBookToken = (itemName: string) => {
    const tokenNo = `TKN-${Math.floor(100 + Math.random() * 900)}`;
    setOrderedTokens([...orderedTokens, itemName]);
    addNotification(
      'Canteen Token Generated',
      `Token ${tokenNo} issued for ${itemName}. Collect from Counter 2.`,
      'alert'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-[#102a43] rounded-3xl p-6 sm:p-8 text-white border border-navy-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
            FSSAI 5-Star Hygiene Rated
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            The Hub: Campus Dining & Cafeteria
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Nutritious, subsidized dining menus, espresso cafe, and mobile digital food tokens
          </p>
        </div>

        <div className="bg-navy-950/70 p-3.5 rounded-2xl border border-navy-700 text-xs">
          <p className="text-slate-400 font-medium">Dining Hall Hours:</p>
          <p className="font-bold text-white mt-0.5">07:30 AM — 10:30 PM Daily</p>
          <p className="text-brand-cyan text-[10px] font-semibold mt-0.5">Smart Student Card RFID Accepted</p>
        </div>
      </div>

      {/* Meal Selection Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((meal) => (
          <button
            key={meal}
            onClick={() => setSelectedMeal(meal as any)}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              selectedMeal === meal
                ? 'bg-brand-cyan text-navy-950 shadow-sm'
                : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-800'
            }`}
          >
            {meal} Menu
          </button>
        ))}
      </div>

      {/* Food Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mealMenus[selectedMeal].map((item) => {
          const isOrdered = orderedTokens.includes(item.name);

          return (
            <div
              key={item.name}
              className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                    Pure Vegetarian
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">{item.calories}</span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {item.name}
                  </h4>
                  <span className="text-base font-extrabold text-brand-cyan shrink-0">
                    {item.price}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Freshly prepared on demand</span>
                <button
                  onClick={() => handleBookToken(item.name)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isOrdered
                      ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                      : 'bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 shadow-xs'
                  }`}
                >
                  {isOrdered ? 'Token Issued' : 'Order Food Token'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
