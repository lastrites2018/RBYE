import React, { useState } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import useLocalPreferences from "../hooks/useLocalPreferences";

export default function SettingsPage() {
  const { hiddenCompanies, bookmarks, unhideCompany, toggleBookmark, mounted } =
    useLocalPreferences();
  const [expandedLink, setExpandedLink] = useState<string | null>(null);

  return (
    <Layout title="설정 | RBYE" canonicalPath="/settings">
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="max-w-[640px] mx-auto px-4 pb-12">
        <h1 className="text-lg font-bold text-gray-800 mb-6">설정</h1>

        {!mounted ? null : (
          <>
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
                        className="bg-white border border-gray-200 rounded overflow-hidden"
                      >
                        <div
                          className="flex items-center justify-between gap-2 p-3 cursor-pointer"
                          onClick={() => setExpandedLink(isOpen ? null : b.link)}
                        >
                          <span className="text-sm text-gray-700 line-clamp-1 min-w-0">
                            {b.subject}
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
                                    <p>{b.contentObj.requirement}</p>
                                  </div>
                                )}
                                {b.contentObj.preferentialTreatment && (
                                  <div>
                                    <p className="font-semibold text-gray-700 mb-0.5">우대사항</p>
                                    <p>{b.contentObj.preferentialTreatment}</p>
                                  </div>
                                )}
                                {b.contentObj.mainTask && (
                                  <div>
                                    <p className="font-semibold text-gray-700 mb-0.5">주요업무</p>
                                    <p>{b.contentObj.mainTask}</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400">본문 데이터가 없는 이전 즐겨찾기입니다.</p>
                            )}
                            <div className="flex items-center justify-end mt-2">
                              <button
                                className="text-amber-500 hover:text-gray-400 transition-colors text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBookmark({
                                    link: b.link,
                                    companyName: b.companyName,
                                    subject: b.subject,
                                  });
                                }}
                                title="즐겨찾기 해제"
                              >
                                ★
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* 안내 */}
            <p className="text-xs text-gray-400 text-center">
              모든 설정은 브라우저 로컬 스토리지에 저장됩니다. 브라우저 데이터를 삭제하면 초기화됩니다.
            </p>
          </>
        )}
      </div>
    </Layout>
  );
}
