"use client";

import { UserIcon, ChatBubbleIcon, CloseIcon } from "@/components/dashboard/DashboardIcons";
import DashboardChatbot from "@/components/dashboard/DashboardChatbot";

export default function AiTab({
  t,
  lang,
  currentWebsite,
  aiUsage,
  conversationsList,
  conversationsLoading,
  selectedConversation,
  setSelectedConversation,
  handleDeleteConversation,
  chatbotContent,
  setChatbotContent,
  isEditingKnowledge,
  setIsEditingKnowledge,
  chatbotKnowledge,
  handleUpdateChatbotKnowledge,
  iaSaved,
  iaSaving,
}) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;

  const monthsShortEs = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const monthsShortEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthsFullEs = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const monthsFullEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getMonthLabel = (m, y, short = false) => {
    const list = lang === "es" ? (short ? monthsShortEs : monthsFullEs) : (short ? monthsShortEn : monthsFullEn);
    return `${list[m - 1]} ${y}`;
  };

  const currentMonthLabelStr = getMonthLabel(currentMonthNum, currentYear, false);

  // Current month record
  const currentMonthRecord = aiUsage.find(u => u.year === currentYear && u.month === currentMonthNum) || {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  };

  // All-Time metrics
  const allTimePrompt = aiUsage.reduce((acc, u) => acc + u.promptTokens, 0);
  const allTimeCompletion = aiUsage.reduce((acc, u) => acc + u.completionTokens, 0);
  const allTimeTotal = aiUsage.reduce((acc, u) => acc + u.totalTokens, 0);
  const activeMonthsCount = aiUsage.filter(u => u.totalTokens > 0).length || (aiUsage.length > 0 ? aiUsage.length : 1);
  const monthlyAverage = Math.round(allTimeTotal / activeMonthsCount);

  // Chronological usage for charts (oldest to newest)
  const chronologicalUsage = [...aiUsage].sort((a, b) => (a.year * 100 + a.month) - (b.year * 100 + b.month));
  const maxMonthlyTotal = Math.max(...chronologicalUsage.map(u => u.totalTokens), 1);

  return (
    <div className="space-y-10 animate-fade-in w-full max-w-full">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-sm shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5a2.25 2.25 0 01.659 1.591v3.159a2.25 2.25 0 01-2.25 2.25H6.591A2.25 2.25 0 014.34 19.34v-3.159c0-.597.237-1.17.659-1.591L9.75 9.5" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-950 tracking-tight">{t.iaTitle}</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{t.iaSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Token Usage Stats Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h4 className="text-lg font-black text-slate-950 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              {t.iaTokenUsage}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{t.iaSubtitle}</p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl shadow-2xs font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              {t.iaCurrentMonth}: {currentMonthLabelStr}
            </span>
          </div>
        </div>

          {/* Top Highlights Grid: Current Month vs All-Time */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
            {/* Current Month Block */}
            <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  {t.iaCurrentMonth} ({currentMonthLabelStr})
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                  {currentMonthRecord.totalTokens.toLocaleString()} tokens
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block mb-1">{t.iaPromptTokens}</span>
                  <span className="text-base font-black font-mono text-slate-900 block">{currentMonthRecord.promptTokens.toLocaleString()}</span>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block mb-1">{t.iaCompletionTokens}</span>
                  <span className="text-base font-black font-mono text-slate-900 block">{currentMonthRecord.completionTokens.toLocaleString()}</span>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl text-center">
                  <span className="text-blue-600 text-[10px] font-black uppercase tracking-wider block mb-1">{t.iaTotalTokens}</span>
                  <span className="text-base font-black font-mono text-blue-950 block">{currentMonthRecord.totalTokens.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                  <span>{t.iaInputCol} ({currentMonthRecord.totalTokens > 0 ? Math.round((currentMonthRecord.promptTokens / currentMonthRecord.totalTokens) * 100) : 0}%)</span>
                  <span>{t.iaOutputCol} ({currentMonthRecord.totalTokens > 0 ? Math.round((currentMonthRecord.completionTokens / currentMonthRecord.totalTokens) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-slate-700 h-full transition-all duration-500"
                    style={{ width: currentMonthRecord.totalTokens > 0 ? `${(currentMonthRecord.promptTokens / currentMonthRecord.totalTokens) * 100}%` : '0%' }}
                    title={`${t.iaPromptTokens}: ${currentMonthRecord.promptTokens}`}
                  />
                  <div
                    className="bg-blue-600 h-full transition-all duration-500"
                    style={{ width: currentMonthRecord.totalTokens > 0 ? `${(currentMonthRecord.completionTokens / currentMonthRecord.totalTokens) * 100}%` : '0%' }}
                    title={`${t.iaCompletionTokens}: ${currentMonthRecord.completionTokens}`}
                  />
                </div>
              </div>
            </div>

            {/* All-Time Usage Block */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {t.iaAllTimeUsage}
                  </span>
                  <span className="text-[10px] font-mono bg-white/10 text-slate-200 px-2 py-0.5 rounded-md">
                    {activeMonthsCount} {t.iaActiveMonths.toLowerCase()}
                  </span>
                </div>

                <div className="mt-2">
                  <span className="text-3xl font-black font-mono tracking-tight text-white block">
                    {allTimeTotal.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                    {t.iaMonthlyAverage}: <span className="font-mono text-slate-200 font-bold">{monthlyAverage.toLocaleString()}</span> tokens/mes
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">{t.iaPromptTokens}</span>
                  <span className="font-mono font-bold text-slate-200">{allTimePrompt.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">{t.iaCompletionTokens}</span>
                  <span className="font-mono font-bold text-slate-200">{allTimeCompletion.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Usage Over Time Chart */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs mb-6">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 005.814-5.519l2.74-1.22" />
                </svg>
                {t.iaUsageOverTime}
              </h5>

              <div className="flex items-center gap-4 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-700 inline-block"></span>
                  {t.iaInputCol}
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block"></span>
                  {t.iaOutputCol}
                </span>
              </div>
            </div>

            {chronologicalUsage.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-8 text-center font-medium">{t.iaNoUsageHistory}</p>
            ) : (
              <div className="pt-4 pb-2">
                <div className="h-44 flex items-end justify-around gap-2 sm:gap-4 px-2 border-b border-slate-200">
                  {chronologicalUsage.map((u) => {
                    const pct = maxMonthlyTotal > 0 ? (u.totalTokens / maxMonthlyTotal) * 100 : 0;
                    const promptPctOfBar = u.totalTokens > 0 ? (u.promptTokens / u.totalTokens) * 100 : 50;
                    const isCurrent = u.year === currentYear && u.month === currentMonthNum;
                    const monthLabelShort = getMonthLabel(u.month, u.year, true);
                    const monthLabelFull = getMonthLabel(u.month, u.year, false);

                    return (
                      <div key={`${u.year}-${u.month}`} className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer max-w-[80px]">
                        {/* Tooltip on Hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none absolute -top-20 z-20 bg-slate-900 text-white text-[10px] rounded-xl p-2.5 shadow-xl min-w-[140px] whitespace-nowrap transform -translate-y-2 group-hover:translate-y-0">
                          <div className="font-bold border-b border-white/20 pb-1 mb-1 text-slate-200">{monthLabelFull}</div>
                          <div className="flex justify-between gap-2 text-slate-300">
                            <span>{t.iaInputCol}:</span>
                            <span className="font-mono text-white font-bold">{u.promptTokens.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between gap-2 text-slate-300">
                            <span>{t.iaOutputCol}:</span>
                            <span className="font-mono text-white font-bold">{u.completionTokens.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between gap-2 text-blue-300 font-bold border-t border-white/10 pt-1 mt-1">
                            <span>{t.iaTotalCol}:</span>
                            <span className="font-mono text-white">{u.totalTokens.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Bar Value Header */}
                        <span className="text-[10px] font-mono font-bold text-slate-500 mb-1 group-hover:text-slate-900 transition-colors">
                          {u.totalTokens > 999 ? `${(u.totalTokens / 1000).toFixed(1)}k` : u.totalTokens}
                        </span>

                        {/* Stacked Vertical Bar */}
                        <div className="w-full bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end transition-all group-hover:ring-2 group-hover:ring-blue-500/30" style={{ height: `${Math.max(pct, 6)}%` }}>
                          <div
                            className="bg-slate-700 w-full transition-all"
                            style={{ height: `${promptPctOfBar}%` }}
                          />
                          <div
                            className="bg-blue-600 w-full transition-all"
                            style={{ height: `${100 - promptPctOfBar}%` }}
                          />
                        </div>

                        {/* Month Label below chart */}
                        <span className={`text-[10px] font-bold mt-2 font-mono ${isCurrent ? 'text-blue-700 font-black' : 'text-slate-500'}`}>
                          {monthLabelShort}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Monthly Breakdown Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                {t.iaMonthlyBreakdown}
              </h5>
              <span className="text-[11px] font-mono text-slate-400 font-medium">
                {aiUsage.length} {t.iaActiveMonths.toLowerCase()}
              </span>
            </div>

            {aiUsage.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center font-medium">{t.iaNoUsageHistory}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-black uppercase text-[9px] tracking-wider border-b border-slate-100">
                      <th className="px-5 py-3">{t.iaMonthCol}</th>
                      <th className="px-4 py-3 text-right">{t.iaInputCol}</th>
                      <th className="px-4 py-3 text-right">{t.iaOutputCol}</th>
                      <th className="px-4 py-3 text-right">{t.iaTotalCol}</th>
                      <th className="px-5 py-3 text-right">{t.iaShareCol}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {aiUsage.map((u) => {
                      const isCurrent = u.year === currentYear && u.month === currentMonthNum;
                      const sharePct = allTimeTotal > 0 ? ((u.totalTokens / allTimeTotal) * 100).toFixed(1) : 0;
                      const monthName = getMonthLabel(u.month, u.year, false);

                      return (
                        <tr key={u.id || `${u.year}-${u.month}`} className={`hover:bg-slate-50/80 transition-colors ${isCurrent ? 'bg-blue-50/30' : ''}`}>
                          <td className="px-5 py-3.5 font-bold text-slate-800 flex items-center gap-2">
                            {monthName}
                            {isCurrent && (
                              <span className="text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                                {t.iaCurrentMonth}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-slate-600">{u.promptTokens.toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-right font-mono text-slate-600">{u.completionTokens.toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-right font-mono font-black text-slate-900">{u.totalTokens.toLocaleString()}</td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-mono text-[11px] font-bold text-slate-500">{sharePct}%</span>
                              <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden inline-block">
                                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${sharePct}%` }}></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Visitor Chat Conversations History */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.596.596 0 01-.744-.555c0-.125.034-.249.098-.35a6.046 6.046 0 00.865-2.222A8.134 8.134 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                Historial de Conversaciones de Visitantes
              </h4>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Registro de chats atendidos por la IA para {currentWebsite.domain}</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-2xs">
              {conversationsList.length} chats
            </span>
          </div>

          {conversationsLoading ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium animate-pulse">
              Cargando conversaciones...
            </div>
          ) : conversationsList.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-xl p-8 text-center">
              <p className="text-xs text-slate-400 italic font-medium">No se han registrado conversaciones de visitantes aún.</p>
              <p className="text-[11px] text-slate-400 mt-1">Los diálogos entre visitantes y el chatbot de IA se guardarán automáticamente aquí.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs divide-y divide-slate-100">
              {conversationsList.map((conv) => (
                <div key={conv.id} className="p-4 hover:bg-slate-50/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setSelectedConversation(conv)}>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-black text-slate-900 font-mono truncate max-w-[200px] sm:max-w-none inline-flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{conv.visitorName || conv.visitorId}</span>
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                        {conv.messageCount} msgs
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono sm:ml-auto">
                        {new Date(conv.lastMessageAt).toLocaleString("es-ES", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate font-medium">
                      {`"${conv.firstMessageSnippet}"`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-1 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => setSelectedConversation(conv)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
                    >
                      Ver Transcript
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteConversation(conv.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      title="Eliminar conversación"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversation Transcript Modal */}
        {selectedConversation && (
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedConversation(null); }}
          >
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[90vh] sm:max-h-[85vh]">
              {/* Sticky Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <div className="min-w-0 pr-2">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <ChatBubbleIcon className="w-4.5 h-4.5 text-blue-600" />
                    <span>Transcripción de la Conversación</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                    Visitante: {selectedConversation.visitorName || selectedConversation.visitorId} • {new Date(selectedConversation.startedAt).toLocaleString("es-ES", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedConversation(null)}
                  className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs transition-all cursor-pointer shrink-0"
                  aria-label="Cerrar modal"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Messages Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-100/50">
                {selectedConversation.messages?.map((msg, idx) => (
                  <div
                    key={msg.id || idx}
                    className={`flex flex-col ${msg.sender === "VISITOR" ? "items-start" : "items-end"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                        {msg.sender === "VISITOR" ? `Visitante` : "Asistente IA SPP"}
                      </span>
                      <span className="text-[9px] text-slate-300">
                        {new Date(msg.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div
                      className={`p-3.5 sm:p-4 rounded-2xl max-w-[90%] sm:max-w-[85%] text-xs leading-relaxed shadow-2xs font-medium whitespace-pre-wrap ${
                        msg.sender === "VISITOR"
                          ? "bg-white text-slate-900 border border-slate-200/80 rounded-tl-none"
                          : "bg-slate-950 text-white rounded-tr-none"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sticky Footer */}
              <div className="p-4 border-t border-slate-200 bg-white flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedConversation(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Cerrar Transcripción
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chatbot RAG Editor Form */}
        <form onSubmit={handleUpdateChatbotKnowledge} className="space-y-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1">{t.iaRagContent}</label>
                <p className="text-xs text-slate-500 font-medium">{t.iaRagDesc}</p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-xl shadow-2xs border ${
                  chatbotContent.length >= 40000
                    ? "text-amber-700 bg-amber-50 border-amber-300 font-extrabold"
                    : "text-slate-400 bg-white border-slate-200"
                }`}>
                  {chatbotContent.length.toLocaleString()} / 40,000 caracteres
                </span>

                {!isEditingKnowledge ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingKnowledge(true)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    {t.iaEdit}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingKnowledge(false);
                      setChatbotContent(chatbotKnowledge?.content || "");
                    }}
                    className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    {t.iaCancelEdit}
                  </button>
                )}
              </div>
            </div>
            <textarea
              readOnly={!isEditingKnowledge}
              value={chatbotContent}
              onChange={(e) => setChatbotContent(e.target.value)}
              maxLength={40000}
              placeholder={t.iaPlaceholder}
              className={`w-full h-72 rounded-xl p-4 text-xs resize-y leading-relaxed mt-3 shadow-2xs font-normal transition-all overflow-y-auto ${
                !isEditingKnowledge
                  ? "bg-slate-100/90 border border-slate-200 text-slate-600 cursor-not-allowed select-text"
                  : "bg-white border-2 border-slate-900 text-slate-900 focus:outline-none focus:border-slate-900 cursor-text"
              }`}
            />
          </div>

          {iaSaved && (
            <div className="text-xs text-emerald-800 font-extrabold flex items-center gap-2 bg-emerald-50 border border-emerald-200 p-4 rounded-xl animate-fade-in shadow-xs">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.iaSavedSuccess}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!isEditingKnowledge || iaSaving}
              className="h-11 px-8 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer gap-2"
            >
              {iaSaving ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {t.iaSave}
                </>
              )}
            </button>
          </div>
        </form>

      {/* Live Chatbot Preview / Simulator Section */}
      <div className="pt-6 border-t border-slate-200/80 space-y-4">
        <div>
          <h4 className="text-lg font-black text-slate-950 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a.596.596 0 0 1-.744-.555c0-.125.034-.249.098-.35a6.046 6.046 0 0 0 .865-2.222A8.134 8.134 0 0 1 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
            <span>{lang === "es" ? "Simulador del Chatbot en Vivo" : "Live Chatbot Simulator"}</span>
          </h4>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {lang === "es"
              ? "Prueba e interactúa con el mismo chatbot que verán tus visitantes en tu página web con la base de conocimiento activa."
              : "Test and interact with the same chatbot your visitors will see on your website with the active knowledge base."}
          </p>
        </div>

        <DashboardChatbot
          key={currentWebsite?.domain || "default"}
          currentWebsite={currentWebsite}
          lang={lang}
          t={t}
          chatbotKnowledge={chatbotKnowledge}
        />
      </div>
    </div>
  );
}
