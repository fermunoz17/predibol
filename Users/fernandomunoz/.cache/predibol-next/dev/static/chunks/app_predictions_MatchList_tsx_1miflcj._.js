(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/predictions/MatchList.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MatchList",
    ()=>MatchList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
"use client";
;
;
;
function TeamLogo({ team, align }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-center gap-2 flex-1 ${align === "right" ? "flex-row-reverse" : ""}`,
        children: [
            team.logoUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                src: team.logoUrl,
                alt: team.name,
                width: 28,
                height: 28,
                unoptimized: true,
                className: "shrink-0"
            }, void 0, false, {
                fileName: "[project]/app/predictions/MatchList.tsx",
                lineNumber: 36,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-7 h-7 rounded-full bg-gray-800 shrink-0"
            }, void 0, false, {
                fileName: "[project]/app/predictions/MatchList.tsx",
                lineNumber: 38,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `font-semibold text-sm leading-tight ${align === "right" ? "text-right" : ""}`,
                children: team.name
            }, void 0, false, {
                fileName: "[project]/app/predictions/MatchList.tsx",
                lineNumber: 40,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/predictions/MatchList.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
_c = TeamLogo;
function ProbBar({ homeProb, drawProb, awayProb, homeColor, awayColor }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full flex rounded overflow-hidden h-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    width: `${homeProb * 100}%`,
                    background: homeColor ?? "#3b82f6"
                }
            }, void 0, false, {
                fileName: "[project]/app/predictions/MatchList.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gray-500",
                style: {
                    width: `${drawProb * 100}%`
                }
            }, void 0, false, {
                fileName: "[project]/app/predictions/MatchList.tsx",
                lineNumber: 54,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    width: `${awayProb * 100}%`,
                    background: awayColor ?? "#ef4444"
                }
            }, void 0, false, {
                fileName: "[project]/app/predictions/MatchList.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/predictions/MatchList.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
_c1 = ProbBar;
function outcomeLabel(pred, homeTeam, awayTeam, homeColor, awayColor) {
    const max = Math.max(pred.homeWinProb, pred.drawProb, pred.awayWinProb);
    if (max === pred.homeWinProb) return {
        label: `${homeTeam} to win`,
        color: homeColor ?? "#3b82f6",
        isTeam: true
    };
    if (max === pred.drawProb) return {
        label: "Draw likely",
        color: "#9ca3af",
        isTeam: false
    };
    return {
        label: `${awayTeam} to win`,
        color: awayColor ?? "#ef4444",
        isTeam: true
    };
}
function MatchList({ matches }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
        className: "space-y-3",
        children: matches.map((match)=>{
            const pred = match.prediction;
            const awayColor = match.awayTeam.secondaryColor ?? match.awayTeam.primaryColor;
            const outcome = pred ? outcomeLabel(pred, match.homeTeam.name, match.awayTeam.name, match.homeTeam.primaryColor, awayColor) : null;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: `/predictions/${match.id}`,
                    className: "block border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-colors",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TeamLogo, {
                                    team: match.homeTeam,
                                    align: "right"
                                }, void 0, false, {
                                    fileName: "[project]/app/predictions/MatchList.tsx",
                                    lineNumber: 82,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs text-gray-500 uppercase tracking-wider shrink-0 w-6 text-center",
                                    children: "vs"
                                }, void 0, false, {
                                    fileName: "[project]/app/predictions/MatchList.tsx",
                                    lineNumber: 83,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TeamLogo, {
                                    team: match.awayTeam,
                                    align: "left"
                                }, void 0, false, {
                                    fileName: "[project]/app/predictions/MatchList.tsx",
                                    lineNumber: 84,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/predictions/MatchList.tsx",
                            lineNumber: 81,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-xs text-gray-500 mt-2 text-center",
                            children: [
                                new Date(match.matchDate).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric"
                                }),
                                match.stage ? ` · ${match.stage}` : ""
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/predictions/MatchList.tsx",
                            lineNumber: 87,
                            columnNumber: 15
                        }, this),
                        pred && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProbBar, {
                                    homeProb: pred.homeWinProb,
                                    drawProb: pred.drawProb,
                                    awayProb: pred.awayWinProb,
                                    homeColor: match.homeTeam.primaryColor,
                                    awayColor: awayColor
                                }, void 0, false, {
                                    fileName: "[project]/app/predictions/MatchList.tsx",
                                    lineNumber: 96,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-between text-xs mt-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: match.homeTeam.primaryColor ?? "#3b82f6"
                                            },
                                            children: [
                                                (pred.homeWinProb * 100).toFixed(0),
                                                "%"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/predictions/MatchList.tsx",
                                            lineNumber: 104,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-medium",
                                            style: {
                                                color: outcome?.color
                                            },
                                            children: outcome?.label
                                        }, void 0, false, {
                                            fileName: "[project]/app/predictions/MatchList.tsx",
                                            lineNumber: 105,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: awayColor ?? "#ef4444"
                                            },
                                            children: [
                                                (pred.awayWinProb * 100).toFixed(0),
                                                "%"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/predictions/MatchList.tsx",
                                            lineNumber: 106,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/predictions/MatchList.tsx",
                                    lineNumber: 103,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/predictions/MatchList.tsx",
                            lineNumber: 95,
                            columnNumber: 17
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/predictions/MatchList.tsx",
                    lineNumber: 77,
                    columnNumber: 13
                }, this)
            }, match.id, false, {
                fileName: "[project]/app/predictions/MatchList.tsx",
                lineNumber: 76,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/app/predictions/MatchList.tsx",
        lineNumber: 69,
        columnNumber: 5
    }, this);
}
_c2 = MatchList;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "TeamLogo");
__turbopack_context__.k.register(_c1, "ProbBar");
__turbopack_context__.k.register(_c2, "MatchList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_predictions_MatchList_tsx_1miflcj._.js.map