import React from 'react';

const WindowFunctionPartitionVisualization = () => {
  // 샘플 데이터 - 영화 카테고리, 대여 요금, 대여 날짜 등
  const sampleData = [
    { id: 1, category: 'Action', film: 'Film A', rental_rate: 0.99, rating: 'PG' },
    { id: 2, category: 'Action', film: 'Film B', rental_rate: 2.99, rating: 'PG-13' },
    { id: 3, category: 'Action', film: 'Film C', rental_rate: 4.99, rating: 'R' },
    { id: 4, category: 'Comedy', film: 'Film D', rental_rate: 0.99, rating: 'G' },
    { id: 5, category: 'Comedy', film: 'Film E', rental_rate: 2.99, rating: 'PG' },
    { id: 6, category: 'Drama', film: 'Film F', rental_rate: 4.99, rating: 'PG-13' },
    { id: 7, category: 'Drama', film: 'Film G', rental_rate: 0.99, rating: 'G' },
    { id: 8, category: 'Drama', film: 'Film H', rental_rate: 2.99, rating: 'PG' },
    { id: 9, category: 'Action', film: 'Film I', rental_rate: 4.99, rating: 'R' },
  ];

  // 파티션 옵션
  const partitionOptions = [
    { name: "전체 데이터", value: null, description: "OVER()" },
    { name: "카테고리별", value: "category", description: "OVER(PARTITION BY category)" },
    { name: "대여 요금별", value: "rental_rate", description: "OVER(PARTITION BY rental_rate)" },
    { name: "등급별", value: "rating", description: "OVER(PARTITION BY rating)" },
    { name: "카테고리 및 등급별", value: "category_rating", description: "OVER(PARTITION BY category, rating)" }
  ];

  // 윈도우 함수 옵션
  const windowFunctions = [
    { name: "AVG(rental_rate)", value: "avg", description: "각 파티션 내 대여 요금의 평균" },
    { name: "SUM(rental_rate)", value: "sum", description: "각 파티션 내 대여 요금의 합계" },
    { name: "COUNT(*)", value: "count", description: "각 파티션 내 행의 개수" },
    { name: "ROW_NUMBER()", value: "rownum", description: "각 파티션 내 행 번호" },
    { name: "RANK()", value: "rank", description: "각 파티션 내 대여 요금 기준 순위(동일 값은 동일 순위)" }
  ];

  // 정렬 옵션
  const orderByOptions = [
    { name: "정렬 없음", value: null, description: "ORDER BY 없음" },
    { name: "대여 요금 오름차순", value: "rental_rate_asc", description: "ORDER BY rental_rate ASC" },
    { name: "대여 요금 내림차순", value: "rental_rate_desc", description: "ORDER BY rental_rate DESC" },
    { name: "영화 제목 오름차순", value: "film_asc", description: "ORDER BY film ASC" }
  ];

  // 상태 관리
  const [selectedPartition, setSelectedPartition] = React.useState(0);
  const [selectedFunction, setSelectedFunction] = React.useState(0);
  const [selectedOrderBy, setSelectedOrderBy] = React.useState(0);
  const [showSqlExample, setShowSqlExample] = React.useState(false);

  // 파티션을 기준으로 데이터 그룹화
  const groupDataByPartition = () => {
    const partitionValue = partitionOptions[selectedPartition].value;
    
    if (!partitionValue) {
      // 전체 데이터가 하나의 파티션
      return { "전체 데이터": [...sampleData] };
    }
    
    if (partitionValue === "category_rating") {
      // 카테고리 및 등급별 파티션
      return sampleData.reduce((acc, row) => {
        const key = `${row.category}, ${row.rating}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(row);
        return acc;
      }, {});
    }
    
    // 단일 컬럼 기준 파티션
    return sampleData.reduce((acc, row) => {
      const key = row[partitionValue];
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, {});
  };

  // 파티션 그룹
  const partitionGroups = groupDataByPartition();

  // 정렬 적용
  const applyOrderBy = (partitionedData) => {
    const orderByValue = orderByOptions[selectedOrderBy].value;
    
    if (!orderByValue) return partitionedData; // 정렬 없음
    
    const result = {};
    
    Object.keys(partitionedData).forEach(partitionKey => {
      let sortedData = [...partitionedData[partitionKey]];
      
      if (orderByValue === "rental_rate_asc") {
        sortedData.sort((a, b) => a.rental_rate - b.rental_rate);
      } else if (orderByValue === "rental_rate_desc") {
        sortedData.sort((a, b) => b.rental_rate - a.rental_rate);
      } else if (orderByValue === "film_asc") {
        sortedData.sort((a, b) => a.film.localeCompare(b.film));
      }
      
      result[partitionKey] = sortedData;
    });
    
    return result;
  };

  // 정렬된 파티션 데이터
  const orderedPartitionGroups = applyOrderBy(partitionGroups);

  // 윈도우 함수 계산
  const calculateWindowFunction = (partitionData, rowIndex) => {
    const functionValue = windowFunctions[selectedFunction].value;
    
    if (functionValue === "avg") {
      const sum = partitionData.reduce((acc, row) => acc + row.rental_rate, 0);
      return (sum / partitionData.length).toFixed(2);
    } else if (functionValue === "sum") {
      const sum = partitionData.reduce((acc, row) => acc + row.rental_rate, 0);
      return sum.toFixed(2);
    } else if (functionValue === "count") {
      return partitionData.length;
    } else if (functionValue === "rownum") {
      return rowIndex + 1;
    } else if (functionValue === "rank") {
      const currentRow = partitionData[rowIndex];
      const orderByValue = orderByOptions[selectedOrderBy].value;
      
      if (!orderByValue || orderByValue === "film_asc") {
        // 정렬이 없거나 영화 제목 정렬일 경우 의미 없는 순위
        return "-";
      }
      
      // 대여 요금 기준 순위 계산
      const isDesc = orderByValue === "rental_rate_desc";
      let rank = 1;
      
      for (let i = 0; i < partitionData.length; i++) {
        const compareResult = partitionData[i].rental_rate - currentRow.rental_rate;
        if ((isDesc && compareResult > 0) || (!isDesc && compareResult < 0)) {
          rank++;
        }
      }
      
      return rank;
    }
    
    return "-";
  };

  // SQL 예제 생성
  const generateSqlExample = () => {
    const partitionValue = partitionOptions[selectedPartition].value;
    const functionName = windowFunctions[selectedFunction].name;
    const orderByValue = orderByOptions[selectedOrderBy].value;
    
    let partitionClause = "";
    if (partitionValue) {
      if (partitionValue === "category_rating") {
        partitionClause = "PARTITION BY f.category, f.rating";
      } else if (partitionValue === "category") {
        partitionClause = "PARTITION BY c.name";
      } else if (partitionValue === "rental_rate") {
        partitionClause = "PARTITION BY f.rental_rate";
      } else if (partitionValue === "rating") {
        partitionClause = "PARTITION BY f.rating";
      }
    }
    
    let orderByClause = "";
    if (orderByValue) {
      if (orderByValue === "rental_rate_asc") {
        orderByClause = "ORDER BY f.rental_rate ASC";
      } else if (orderByValue === "rental_rate_desc") {
        orderByClause = "ORDER BY f.rental_rate DESC";
      } else if (orderByValue === "film_asc") {
        orderByClause = "ORDER BY f.title ASC";
      }
    }
    
    let overClause = "OVER(";
    if (partitionClause) overClause += partitionClause + " ";
    if (orderByClause) overClause += orderByClause;
    overClause += ")";
    
    return `
SELECT 
    f.title,
    c.name AS category,
    f.rating,
    f.rental_rate,
    ${functionName} ${overClause} AS result
FROM 
    film f
JOIN 
    film_category fc ON f.film_id = fc.film_id
JOIN 
    category c ON fc.category_id = c.category_id
ORDER BY 
    c.name, f.title;
    `;
  };

  // 동일한 파티션에 속한 행들에게 같은 색상 부여
  const getPartitionColor = (partitionKey) => {
    const partitionKeys = Object.keys(orderedPartitionGroups);
    const index = partitionKeys.indexOf(partitionKey);
    const colors = ['bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-red-100', 'bg-purple-100', 'bg-pink-100', 'bg-indigo-100', 'bg-orange-100'];
    return colors[index % colors.length];
  };

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 p-4">
      <h2 className="text-xl font-bold mb-4">윈도우 함수 PARTITION BY 시각화</h2>
      
      {/* 컨트롤 패널 */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PARTITION BY:</label>
          <select 
            className="border rounded px-2 py-1"
            value={selectedPartition}
            onChange={(e) => setSelectedPartition(parseInt(e.target.value))}
          >
            {partitionOptions.map((option, idx) => (
              <option key={idx} value={idx}>{option.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">윈도우 함수:</label>
          <select 
            className="border rounded px-2 py-1"
            value={selectedFunction}
            onChange={(e) => setSelectedFunction(parseInt(e.target.value))}
          >
            {windowFunctions.map((func, idx) => (
              <option key={idx} value={idx}>{func.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ORDER BY:</label>
          <select 
            className="border rounded px-2 py-1"
            value={selectedOrderBy}
            onChange={(e) => setSelectedOrderBy(parseInt(e.target.value))}
          >
            {orderByOptions.map((option, idx) => (
              <option key={idx} value={idx}>{option.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <button 
            className="px-3 py-1 bg-blue-500 text-white rounded"
            onClick={() => setShowSqlExample(!showSqlExample)}
          >
            {showSqlExample ? '예제 숨기기' : 'SQL 예제 보기'}
          </button>
        </div>
      </div>

      {/* SQL 예제 */}
      {showSqlExample && (
        <div className="mb-6 p-4 bg-white rounded shadow">
          <h3 className="font-bold mb-2">SQL 예제:</h3>
          <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-sm">
            {generateSqlExample()}
          </pre>
        </div>
      )}
      
      {/* 현재 OVER 절 설명 */}
      <div className="mb-6 p-4 bg-white rounded shadow">
        <h3 className="font-bold mb-2">현재 선택된 OVER 절:</h3>
        <div className="mb-2">
          <span className="font-mono bg-gray-100 px-1">{partitionOptions[selectedPartition].description}</span>
          {orderByOptions[selectedOrderBy].value && 
            <span className="font-mono bg-gray-100 px-1 ml-1">{orderByOptions[selectedOrderBy].description}</span>
          }
        </div>
        <p className="text-gray-700">{windowFunctions[selectedFunction].description}</p>
      </div>
      
      {/* 데이터 시각화 */}
      <div className="overflow-x-auto bg-white rounded shadow mb-6">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">ID</th>
              <th className="border p-2 text-left">영화</th>
              <th className="border p-2 text-left">카테고리</th>
              <th className="border p-2 text-left">등급</th>
              <th className="border p-2 text-left">대여 요금</th>
              <th className="border p-2 text-left">파티션</th>
              <th className="border p-2 text-left">{windowFunctions[selectedFunction].name} 결과</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(orderedPartitionGroups).flatMap(([partitionKey, rows]) => 
              rows.map((row, rowIndex) => (
                <tr 
                  key={row.id} 
                  className={`${getPartitionColor(partitionKey)}`}
                >
                  <td className="border p-2">{row.id}</td>
                  <td className="border p-2">{row.film}</td>
                  <td className="border p-2">{row.category}</td>
                  <td className="border p-2">{row.rating}</td>
                  <td className="border p-2">${row.rental_rate.toFixed(2)}</td>
                  <td className="border p-2">{partitionKey}</td>
                  <td className="border p-2 font-medium">{calculateWindowFunction(rows, rowIndex)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 파티션 시각화 다이어그램 */}
      <div className="p-4 bg-white rounded shadow">
        <h3 className="font-bold mb-4">PARTITION BY 시각화</h3>
        
        {Object.entries(orderedPartitionGroups).map(([partitionKey, rows], partitionIndex) => (
          <div key={partitionIndex} className="mb-6">
            <h4 className="font-semibold mb-2">파티션: {partitionKey}</h4>
            <div className="flex items-center mb-1">
              <div className="w-20 text-sm">윈도우:</div>
              <div className={`flex-grow h-12 ${getPartitionColor(partitionKey)} rounded relative border border-gray-300`}>
                {rows.map((row, idx) => (
                  <div 
                    key={idx}
                    className="absolute h-full border-r border-gray-400 flex items-center justify-center"
                    style={{
                      left: `${(idx / rows.length) * 100}%`,
                      width: `${(1 / rows.length) * 100}%`,
                    }}
                  >
                    <span className="text-xs">{row.film}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-20 text-sm">결과값:</div>
              <div className="flex-grow">
                {rows.map((row, idx) => (
                  <div 
                    key={idx}
                    className="inline-block text-center text-xs font-medium"
                    style={{
                      width: `${(1 / rows.length) * 100}%`,
                    }}
                  >
                    {calculateWindowFunction(rows, idx)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PARTITION BY 개념 설명 */}
      <div className="mt-6 p-4 bg-white rounded shadow">
        <h3 className="font-bold mb-2">PARTITION BY의 주요 특징</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>데이터 분할:</strong> PARTITION BY는 전체 결과 집합을 지정된 컬럼 값에 따라 독립적인 그룹(파티션)으로 분할합니다.
          </li>
          <li>
            <strong>독립적 계산:</strong> 각 파티션 내에서 윈도우 함수가 독립적으로 계산됩니다.
          </li>
          <li>
            <strong>원본 행 유지:</strong> GROUP BY와 달리 원본 테이블의 모든 행이 결과에 유지됩니다.
          </li>
          <li>
            <strong>다중 컬럼:</strong> 여러 컬럼을 기준으로 파티션을 나눌 수 있습니다 (예: PARTITION BY category, rating).
          </li>
          <li>
            <strong>ORDER BY와 결합:</strong> 파티션 내에서 행의 순서를 지정하여 순위 함수나 누적 계산에 활용할 수 있습니다.
          </li>
        </ul>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm">
            <strong>참고:</strong> PARTITION BY 절이 없으면 전체 결과 집합이 하나의 파티션으로 처리됩니다. 이는 모든 행에 대해 동일한 결과가 계산됨을 의미합니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WindowFunctionPartitionVisualization;