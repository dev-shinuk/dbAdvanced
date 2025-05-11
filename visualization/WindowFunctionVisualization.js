import React from 'react';

const WindowFunctionVisualization = () => {
  // 샘플 데이터 - 영화 대여 요금 및 대여 날짜
  const sampleData = [
    { id: 1, film: 'Film A', rental_rate: 0.99, rental_date: '2023-01-05' },
    { id: 2, film: 'Film B', rental_rate: 2.99, rental_date: '2023-01-12' },
    { id: 3, film: 'Film C', rental_rate: 4.99, rental_date: '2023-01-18' },
    { id: 4, film: 'Film D', rental_rate: 2.99, rental_date: '2023-01-25' },
    { id: 5, film: 'Film E', rental_rate: 0.99, rental_date: '2023-02-01' },
    { id: 6, film: 'Film F', rental_rate: 4.99, rental_date: '2023-02-07' },
    { id: 7, film: 'Film G', rental_rate: 2.99, rental_date: '2023-02-14' },
  ];

  // 프레임 유형
  const frameTypes = [
    { 
      name: "CURRENT ROW", 
      description: "현재 행만 포함",
      rows: "ROWS BETWEEN CURRENT ROW AND CURRENT ROW",
      range: "RANGE BETWEEN CURRENT ROW AND CURRENT ROW",
    },
    { 
      name: "UNBOUNDED PRECEDING", 
      description: "처음부터 현재 행까지",
      rows: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
      range: "RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
    },
    { 
      name: "n PRECEDING", 
      description: "현재 행으로부터 n행 앞까지",
      rows: "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW",
      range: "RANGE BETWEEN 2 PRECEDING AND CURRENT ROW",
    },
    { 
      name: "BETWEEN n PRECEDING AND m FOLLOWING", 
      description: "앞뒤로 특정 범위",
      rows: "ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING",
      range: "RANGE BETWEEN 1 PRECEDING AND 1 FOLLOWING",
    },
    { 
      name: "UNBOUNDED FOLLOWING", 
      description: "현재 행부터 끝까지",
      rows: "ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING",
      range: "RANGE BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING",
    },
  ];

  // 현재 선택된 프레임 (기본값: UNBOUNDED PRECEDING)
  const [selectedFrame, setSelectedFrame] = React.useState(1);
  // 현재 선택된 행 (기본값: 4번 행)
  const [currentRow, setCurrentRow] = React.useState(3);
  // 프레임 유형 (ROWS 또는 RANGE)
  const [frameType, setFrameType] = React.useState('ROWS');

  // ROWS 프레임에서 포함되는 행 인덱스 계산
  const getIncludedRowIndices = () => {
    const currentFrameType = frameTypes[selectedFrame];
    const indices = [];
    
    if (currentFrameType.name === "CURRENT ROW") {
      indices.push(currentRow);
    } 
    else if (currentFrameType.name === "UNBOUNDED PRECEDING") {
      for (let i = 0; i <= currentRow; i++) {
        indices.push(i);
      }
    }
    else if (currentFrameType.name === "n PRECEDING") {
      const start = Math.max(0, currentRow - 2);
      for (let i = start; i <= currentRow; i++) {
        indices.push(i);
      }
    }
    else if (currentFrameType.name === "BETWEEN n PRECEDING AND m FOLLOWING") {
      const start = Math.max(0, currentRow - 1);
      const end = Math.min(sampleData.length - 1, currentRow + 1);
      for (let i = start; i <= end; i++) {
        indices.push(i);
      }
    }
    else if (currentFrameType.name === "UNBOUNDED FOLLOWING") {
      for (let i = currentRow; i < sampleData.length; i++) {
        indices.push(i);
      }
    }
    
    return indices;
  };

  // RANGE 프레임에서 포함되는 행 인덱스 계산
  const getIncludedRangeIndices = () => {
    const currentFrameType = frameTypes[selectedFrame];
    const indices = [];
    const currentValue = sampleData[currentRow].rental_rate;
    
    if (currentFrameType.name === "CURRENT ROW") {
      // 현재 행과 동일한 값을 가진 모든 행 포함
      sampleData.forEach((row, index) => {
        if (row.rental_rate === currentValue) {
          indices.push(index);
        }
      });
    } 
    else if (currentFrameType.name === "UNBOUNDED PRECEDING") {
      // 처음부터 현재 행까지 모든 행 포함 (ROWS와 동일)
      for (let i = 0; i <= currentRow; i++) {
        indices.push(i);
      }
    }
    else if (currentFrameType.name === "n PRECEDING") {
      // rental_rate 값이 현재 값 - 2 이상인 행 포함 (단, 현재 행 이전만)
      const lowerBound = currentValue - 2;
      for (let i = 0; i <= currentRow; i++) {
        if (sampleData[i].rental_rate >= lowerBound) {
          indices.push(i);
        }
      }
    }
    else if (currentFrameType.name === "BETWEEN n PRECEDING AND m FOLLOWING") {
      // rental_rate 값이 현재 값 ± 1 범위 내의 모든 행 포함
      const lowerBound = currentValue - 1;
      const upperBound = currentValue + 1;
      sampleData.forEach((row, index) => {
        if (row.rental_rate >= lowerBound && row.rental_rate <= upperBound) {
          indices.push(index);
        }
      });
    }
    else if (currentFrameType.name === "UNBOUNDED FOLLOWING") {
      // 현재 행부터 끝까지 모든 행 포함 (ROWS와 동일)
      for (let i = currentRow; i < sampleData.length; i++) {
        indices.push(i);
      }
    }
    
    return indices;
  };

  // 선택된 프레임 유형에 따라 포함되는 행 계산
  const includedIndices = frameType === 'ROWS' ? getIncludedRowIndices() : getIncludedRangeIndices();
  
  // AVG 계산
  const calculateAvg = () => {
    const includedRows = includedIndices.map(idx => sampleData[idx]);
    const sum = includedRows.reduce((acc, row) => acc + row.rental_rate, 0);
    return (sum / includedRows.length).toFixed(2);
  };

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 p-4">
      <h2 className="text-xl font-bold mb-4">윈도우 함수 프레임절에서 현재행(CURRENT ROW)의 의미 시각화</h2>
      
      {/* 컨트롤 패널 */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">프레임 유형:</label>
          <div className="flex gap-2">
            <button 
              className={`px-3 py-1 rounded ${frameType === 'ROWS' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setFrameType('ROWS')}
            >
              ROWS
            </button>
            <button 
              className={`px-3 py-1 rounded ${frameType === 'RANGE' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setFrameType('RANGE')}
            >
              RANGE
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">프레임 옵션:</label>
          <select 
            className="border rounded px-2 py-1"
            value={selectedFrame}
            onChange={(e) => setSelectedFrame(parseInt(e.target.value))}
          >
            {frameTypes.map((type, idx) => (
              <option key={idx} value={idx}>{type.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">현재 행:</label>
          <select 
            className="border rounded px-2 py-1"
            value={currentRow}
            onChange={(e) => setCurrentRow(parseInt(e.target.value))}
          >
            {sampleData.map((row, idx) => (
              <option key={idx} value={idx}>행 {idx+1}: {row.film}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 프레임 설명 */}
      <div className="mb-6 p-4 bg-white rounded shadow">
        <h3 className="font-bold mb-2">현재 선택된 프레임:</h3>
        <div className="mb-2"><span className="font-mono bg-gray-100 px-1">{frameType === 'ROWS' ? frameTypes[selectedFrame].rows : frameTypes[selectedFrame].range}</span></div>
        <p className="text-gray-700">{frameTypes[selectedFrame].description}</p>
        
        <div className="mt-4">
          <h4 className="font-semibold">AVG() 계산 결과: <span className="text-blue-600">{calculateAvg()}</span></h4>
          <p className="text-sm text-gray-600">선택된 프레임 내 rental_rate 값들의 평균</p>
        </div>
      </div>
      
      {/* 데이터 시각화 */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">행 번호</th>
              <th className="border p-2 text-left">Film</th>
              <th className="border p-2 text-left">Rental Rate</th>
              <th className="border p-2 text-left">Rental Date</th>
              <th className="border p-2 text-left">프레임에 포함</th>
            </tr>
          </thead>
          <tbody>
            {sampleData.map((row, idx) => (
              <tr 
                key={idx} 
                className={`
                  ${idx === currentRow ? 'bg-yellow-100' : ''}
                  ${includedIndices.includes(idx) && idx !== currentRow ? 'bg-blue-50' : ''}
                `}
              >
                <td className="border p-2">{idx + 1}</td>
                <td className="border p-2">{row.film}</td>
                <td className="border p-2">${row.rental_rate}</td>
                <td className="border p-2">{row.rental_date}</td>
                <td className="border p-2">
                  {idx === currentRow ? (
                    <span className="bg-yellow-200 px-2 py-1 rounded text-sm">현재 행</span>
                  ) : includedIndices.includes(idx) ? (
                    <span className="bg-blue-200 px-2 py-1 rounded text-sm">포함됨</span>
                  ) : (
                    <span className="bg-gray-200 px-2 py-1 rounded text-sm">제외됨</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 시각적 다이어그램 */}
      <div className="mt-6 p-4 bg-white rounded shadow">
        <h3 className="font-bold mb-4">프레임 시각화</h3>
        <div className="flex items-center">
          <div className="flex-grow h-12 bg-gray-200 rounded relative">
            {sampleData.map((row, idx) => (
              <div 
                key={idx}
                className={`absolute h-full ${
                  idx === currentRow ? 'bg-yellow-300 border-2 border-yellow-600' : 
                  includedIndices.includes(idx) ? 'bg-blue-300' : 'bg-gray-300'
                }`}
                style={{
                  left: `${(idx / sampleData.length) * 100}%`,
                  width: `${(1 / sampleData.length) * 100}%`,
                }}
                title={`Film ${idx+1}: ${row.film}`}
              >
                <div className="absolute top-full mt-1 text-xs font-mono">{idx+1}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-300 border border-yellow-600"></div>
            <span>현재 행</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-300"></div>
            <span>프레임에 포함된 행</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300"></div>
            <span>프레임에서 제외된 행</span>
          </div>
        </div>
      </div>

      {/* ROWS와 RANGE의 차이점 설명 */}
      <div className="mt-6 p-4 bg-white rounded shadow">
        <h3 className="font-bold mb-2">ROWS와 RANGE의 주요 차이점</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border rounded">
            <h4 className="font-semibold mb-2">ROWS</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>물리적 행 위치 기준으로 프레임 정의</li>
              <li>정확히 n개의 행을 포함</li>
              <li>값이 같은 행도 별도로 처리</li>
              <li>행 위치 기반 계산 (예: 이전 3개 행)</li>
              <li>예측 가능하고 정확한 행 수 필요시 유용</li>
            </ul>
          </div>
          <div className="p-3 border rounded">
            <h4 className="font-semibold mb-2">RANGE</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>값의 범위 기준으로 프레임 정의</li>
              <li>값이 같은 행들은 같은 그룹으로 처리</li>
              <li>프레임에 포함되는 행 수가 가변적</li>
              <li>값 기반 계산 (예: 현재 값 ±1 범위)</li>
              <li>동일 값 처리나 논리적 범위 계산시 유용</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WindowFunctionVisualization;