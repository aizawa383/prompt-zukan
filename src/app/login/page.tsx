"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage(
          "確認メールを送りました。メールのリンクをクリックしてください。",
        );
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError("メールアドレスかパスワードが違います");
      } else {
        router.push("/home");
        router.refresh();
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">✦</div>
          <h1 className="text-xl font-semibold text-gray-700">
            プロンプト図鑑
          </h1>
          <p className="text-sm text-gray-400 mt-1">自分だけの知識図鑑</p>
        </div>

        {/* カード */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-base font-semibold text-gray-600 mb-6">
            {isSignUp ? "アカウント作成" : "ログイン"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {message && (
              <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-purple-300 hover:bg-purple-400 text-white rounded-full text-sm font-semibold transition disabled:opacity-50"
            >
              {loading
                ? "処理中..."
                : isSignUp
                  ? "アカウントを作成"
                  : "ログイン"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setMessage("");
              }}
              className="text-xs text-gray-400 hover:text-purple-400 transition"
            >
              {isSignUp
                ? "すでにアカウントをお持ちの方はこちら"
                : "アカウントをお持ちでない方はこちら"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
