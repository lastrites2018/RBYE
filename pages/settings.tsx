import React from "react";
import Layout from "../components/Layout";
import useHiddenCompanies from "../hooks/useHiddenCompanies";
import useReadabilityStore from "../stores/useReadabilityStore";
import ToggleRow from "../components/ToggleRow";
import { getPageMeta } from "../utils/constants";

const SETTINGS_PAGE_META = getPageMeta("settings");

export default function SettingsPage() {
  const { hiddenCompanies, unhideCompany, mounted } = useHiddenCompanies();
  const {
    expandBullets, toggleExpandBullets,
    collapsePreferential, toggleCollapsePreferential,
    collapseMainTask, toggleCollapseMainTask,
    hydrate,
  } = useReadabilityStore();

  React.useEffect(() => { hydrate(); }, []);

  return (
    <Layout title={SETTINGS_PAGE_META.pageTitle} pageType="settings" canonicalPath={SETTINGS_PAGE_META.route} noIndex>

      <div className="max-w-[640px] mx-auto px-4 pb-12">
        <h1 className="text-lg font-bold text-gray-800 mb-6">{SETTINGS_PAGE_META.heading}</h1>

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
