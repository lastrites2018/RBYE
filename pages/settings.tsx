import React, { useState } from "react";
import Layout from "../components/Layout";
import useHiddenCompanies from "../hooks/useHiddenCompanies";
import useBookmarks from "../hooks/useBookmarks";
import usePendingAction from "../hooks/usePendingAction";
import useReadabilityStore from "../stores/useReadabilityStore";
import ToggleRow from "../components/ToggleRow";
import normalizeJobText from "../utils/normalizeJobText";

export default function SettingsPage() {
  const { hiddenCompanies, unhideCompany, mounted } = useHiddenCompanies();
  const { bookmarks, toggleBookmark } = useBookmarks();
  const [expandedLink, setExpandedLink] = useState<string | null>(null);
  const {
    expandBullets, toggleExpandBullets,
    collapsePreferential, toggleCollapsePreferential,
    collapseMainTask, toggleCollapseMainTask,
    hydrate,
  } = useReadabilityStore();

  React.useEffect(() => { hydrate(); }, []);

  const removeAction = usePendingAction(
    React.useCallback(
      (link: string) => {
        const b = bookmarks.find((bm) => bm.link === link);
        if (b) toggleBookmark({ link: b.link, companyName: b.companyName, subject: b.subject });
      },
      [bookmarks, toggleBookmark]
    ),
  );

  return (
    <Layout title="설정 | RBYE" canonicalPath="/settings" noIndex>

      <div className="max-w-[640px] mx-auto px-4 pb-12">
        <h1 className="text-lg font-bold text-gray-800 mb-6">설정</h1>

        {!mounted ? null : (
          <div className="bg-white rounded-lg shadow-sm p-5">
            {/* 숨긴 회사 */}
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">
                숨긴 회사 ({hiddenCompanies.length})
              </h2>
              {hiddenCompanies.length === 0 ? (
                <p className="text-xs text-gray-400">숨긴 회사가 없습니다.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {hiddenCompanies.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-600"
                    >
                      {name}
                      <button
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        onClick={() => unhideCompany(name)}
                        title="숨기기 해제"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* 즐겨찾기 */}
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">
                즐겨찾기 ({bookmarks.length})
              </h2>
              {bookmarks.length === 0 ? (
                <p className="text-xs text-gray-400">즐겨찾기한 공고가 없습니다.</p>
              ) : (
                <ul className="space-y-1">
                  {bookmarks.map((b) => {
                    const isOpen = expandedLink === b.link;
                    return (
                      <li
                        key={b.link}
                        className={`bg-white border rounded overflow-hidden transition-all ${
                          removeAction.pendingId === b.link
                            ? "border-dashed border-red-300 opacity-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div
                          className="flex items-center justify-between gap-2 p-3 cursor-pointer"
                          onClick={() => setExpandedLink(isOpen ? null : b.link)}
                        >
                          <span className="text-sm text-gray-700 line-clamp-1 min-w-0">
                            <span className="font-medium">{b.companyName}</span>
                            <span className="text-gray-400 ml-1.5">{b.subject}</span>
                          </span>
                          <span className="flex-shrink-0 text-gray-400 text-xs">
                            {isOpen ? "▲" : "▼"}
                          </span>
                        </div>
                        {isOpen && (
                          <div className="px-3 pb-3 pt-0 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mt-2 mb-2">{b.companyName}</p>
                            {b.contentObj ? (
                              <div className="text-xs text-gray-600 space-y-2 whitespace-pre-wrap">
                                {b.contentObj.requirement && (
                                  <div>
                                    <p className="font-semibold text-gray-700 mb-0.5">자격요건</p>
                                    <p>{normalizeJobText(b.contentObj.requirement)}</p>
                                  </div>
                                )}
                                {b.contentObj.preferentialTreatment && (
                                  <div>
                                    <p className="font-semibold text-gray-700 mb-0.5">우대사항</p>
                                    <p>{normalizeJobText(b.contentObj.preferentialTreatment)}</p>
                                  </div>
                                )}
                                {b.contentObj.mainTask && (
                                  <div>
                                    <p className="font-semibold text-gray-700 mb-0.5">주요업무</p>
                                    <p>{normalizeJobText(b.contentObj.mainTask)}</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400">본문 데이터가 없는 이전 즐겨찾기입니다.</p>
                            )}
                            <div className="flex items-center justify-end mt-2">
                              {removeAction.pendingId === b.link ? (
                                <span
                                  className="bg-red-100 px-2 rounded-full text-red-500 cursor-pointer hover:bg-red-200 transition-colors text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeAction.cancel();
                                  }}
                                >
                                  취소
                                </span>
                              ) : (
                                <button
                                  className="text-amber-500 hover:text-gray-400 transition-colors text-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeAction.start(b.link);
                                  }}
                                  title="즐겨찾기 해제"
                                >
                                  ★
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* 가독성 옵션 */}
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">가독성 옵션</h2>
              <ToggleRow
                label="불릿 항목 줄바꿈"
                description="공고 본문의 불릿(-)마다 줄을 나눠서 표시합니다"
                checked={expandBullets}
                onToggle={toggleExpandBullets}
              />
              <ToggleRow
                label="우대사항 기본 접기"
                description="우대사항을 접어서 카드를 짧게 표시합니다"
                checked={collapsePreferential}
                onToggle={toggleCollapsePreferential}
              />
              <ToggleRow
                label="주요업무 기본 접기"
                description="주요업무를 접어서 카드를 짧게 표시합니다"
                checked={collapseMainTask}
                onToggle={toggleCollapseMainTask}
              />
            </section>

            {/* 안내 */}
            <p className="text-xs text-gray-400 text-center">
              모든 설정은 브라우저 로컬 스토리지에 저장됩니다. 브라우저 데이터를 삭제하면 초기화됩니다.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
