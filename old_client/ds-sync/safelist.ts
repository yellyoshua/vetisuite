/* Safelist para design-sync (claude.ai/design).
   Tailwind v4 solo emite las utilidades que encuentra en el código; el agente de
   diseño escribe pantallas nuevas, así que necesita el vocabulario completo del
   sistema disponible en la hoja compilada. Este archivo no se importa en ninguna
   parte: existe únicamente para que Tailwind lo escanee.
   Regla: solo se listan clases que conventions.md documenta. */
export const DS_SAFELIST = `
flex inline-flex grid block inline-block hidden relative absolute sticky
flex-col flex-row flex-wrap flex-1 shrink-0 grow-0 min-w-0
items-center items-start items-end items-baseline
justify-between justify-center justify-end justify-start
grid-cols-1 grid-cols-2 grid-cols-3 grid-cols-4 col-span-2 col-span-3
gap-1 gap-1.5 gap-2 gap-2.5 gap-3 gap-4 gap-5 gap-6
inset-0 top-0 right-0 z-10 z-50
w-full h-full max-w-full overflow-x-auto overflow-y-auto overflow-hidden
p-0 p-1 p-2 p-3 p-4 p-5 p-6 p-8
px-1 px-2 px-3 px-4 px-5 px-6 px-8 py-1 py-1.5 py-2 py-3 py-4 py-5 py-6
m-0 mt-1 mt-2 mt-3 mt-4 mt-5 mt-6 mb-1 mb-2 mb-3 mb-4 mb-5 mb-6 ml-1 ml-2 ml-auto mr-1 mr-2
space-y-1 space-y-2 space-y-3 space-y-4 space-x-2
text-xs text-sm text-base text-lg text-xl text-2xl
font-normal font-medium font-semibold font-bold
uppercase tracking-tight tracking-wide truncate text-left text-center text-right
leading-tight leading-snug leading-normal whitespace-nowrap
font-head font-body tabular-nums
bg-bg bg-card bg-green bg-green-soft bg-dark bg-dark-hover bg-amber-soft bg-red-soft bg-blue-soft
bg-gray-soft bg-input bg-track bg-skeleton bg-done bg-dropdown-foot bg-opt-hover
text-ink text-sub text-green text-amber text-red text-blue text-card
border border-b border-t border-l border-r border-0 border-line border-line-soft
rounded rounded-md rounded-lg rounded-xl rounded-2xl rounded-full
shadow-lg shadow-2xl transition-opacity transition-colors cursor-pointer
sm:px-6 sm:flex-row sm:grid-cols-2 lg:px-8 lg:py-6 lg:grid-cols-3 lg:grid-cols-4
hover:opacity-80 disabled:opacity-50
`;
