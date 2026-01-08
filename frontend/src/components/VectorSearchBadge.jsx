import React, { useState } from 'react';
import './VectorSearchBadge.css';

/**
 * 向量检索徽章组件
 * 显示向量检索的状态和详细信息
 */
function VectorSearchBadge({ vectorSearch }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!vectorSearch || !vectorSearch.enabled) {
    return null;
  }

  const { total_knowledge, retrieved_count, top_matches } = vectorSearch;

  return (
    <div className="vector-search-badge">
      <button
        className="vector-badge-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? '收起检索详情' : '查看检索详情'}
      >
        <span className="badge-icon">🔍</span>
        <span className="badge-text">
          Top {retrieved_count} 匹配
          <span className="badge-count">
            / {total_knowledge}条知识
          </span>
        </span>
        <span className="badge-arrow">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {isExpanded && (
        <div className="vector-search-details">
          <div className="details-header">
            <span className="details-title">知识库检索结果（Top {retrieved_count} 最相关知识）</span>
            <span className="details-meta">
              从 {total_knowledge} 条知识中筛选出最相关的 {retrieved_count} 条
            </span>
            <span className="details-note">
              💡 为避免信息过载，仅显示相似度最高的 {retrieved_count} 条知识
            </span>
          </div>
          <div className="matches-list">
            {top_matches.map((match, index) => (
              <div key={index} className="match-item">
                <div className="match-header">
                  <span className="match-score">相似度: {(match.score * 100).toFixed(1)}%</span>
                  <span className="match-category">{match.category}</span>
                </div>
                <div className="match-content">{match.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VectorSearchBadge;
