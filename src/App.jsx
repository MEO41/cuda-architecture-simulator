import { useState, useEffect, useRef } from 'react';
import { Play, Pause, ArrowRight, Award, Grid3X3, HardDrive, Cpu, Info } from 'lucide-react';

export default function CUDASimulator() {
  const [activeTab, setActiveTab] = useState('threadHierarchy');
  const [isRunning, setIsRunning] = useState(false);
  const [threadConfig, setThreadConfig] = useState({
    gridDim: { x: 2, y: 2, z: 1 },
    blockDim: { x: 4, y: 4, z: 1 }
  });
  const [kernelCode, setKernelCode] = useState(`__global__ void vectorAdd(float *a, float *b, float *c) {
  int i = blockIdx.x * blockDim.x + threadIdx.x;
  c[i] = a[i] + b[i];
}`);
  const [showQuiz, setShowQuiz] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);
  const [currentTutorial, setCurrentTutorial] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedThreads, setSelectedThreads] = useState([]);
  
  // For memory visualization
  const [memoryType, setMemoryType] = useState('shared');
  const [memoryAccess, setMemoryAccess] = useState([]);
  
  // Animation frame reference
  const animationRef = useRef(null);
  
  // Tutorials data
  const tutorials = [
    { title: "Thread Hierarchy Basics", content: "CUDA organizes threads into blocks, and blocks into grids. This hierarchy allows for massive parallelism." },
    { title: "Memory Architecture", content: "CUDA has different memory types: global, shared, local, constant, and texture. Each has different scope, lifetime, and performance characteristics." },
    { title: "Kernel Execution", content: "A kernel is executed by all threads in parallel. Each thread has unique thread and block indices to identify itself." },
    { title: "Warps and SMs", content: "Threads are executed in groups of 32 called warps. Multiple warps can be assigned to a Streaming Multiprocessor (SM)." }
  ];
  
  // Quiz data
  const quizQuestions = [
    {
      question: "What are the main components of CUDA's thread hierarchy?",
      options: ["Threads, Blocks, Grids", "Processes, Threads, Cores", "Kernels, Functions, Threads", "Warps, Blocks, Lanes"],
      answer: 0
    },
    {
      question: "Which memory type is accessible by all threads in a grid?",
      options: ["Shared Memory", "Local Memory", "Global Memory", "Register Memory"],
      answer: 2
    },
    {
      question: "How many threads typically make up a warp in CUDA?",
      options: ["8", "16", "32", "64"],
      answer: 2
    }
  ];
  
  const [quizState, setQuizState] = useState({
    currentQuestion: 0,
    selectedAnswer: null,
    showFeedback: false,
    correct: false,
    completed: false,
    score: 0
  });

  // Toggle simulation running state
  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  // Handle thread configuration changes
  const handleThreadConfigChange = (dimension, axis, value) => {
    const newValue = parseInt(value);
    if (isNaN(newValue) || newValue < 1 || newValue > 8) return;
    
    setThreadConfig(prev => ({
      ...prev,
      [dimension]: {
        ...prev[dimension],
        [axis]: newValue
      }
    }));
  };

  // Handle kernel code changes
  const handleCodeChange = (e) => {
    setKernelCode(e.target.value);
  };

  // Progress to next tutorial
  const nextTutorial = () => {
    if (currentTutorial < tutorials.length - 1) {
      setCurrentTutorial(currentTutorial + 1);
    } else {
      setShowTutorial(false);
    }
  };
  
  // Handle quiz answer selection
  const selectAnswer = (index) => {
    if (quizState.showFeedback) return;
    
    setQuizState({
      ...quizState,
      selectedAnswer: index,
      showFeedback: true,
      correct: index === quizQuestions[quizState.currentQuestion].answer
    });
    
    if (index === quizQuestions[quizState.currentQuestion].answer) {
      setQuizState(prev => ({...prev, score: prev.score + 1}));
    }
  };
  
  // Proceed to next question or finish quiz
  const nextQuestion = () => {
    if (quizState.currentQuestion < quizQuestions.length - 1) {
      setQuizState({
        ...quizState,
        currentQuestion: quizState.currentQuestion + 1,
        selectedAnswer: null,
        showFeedback: false
      });
    } else {
      setQuizState({
        ...quizState,
        completed: true
      });
    }
  };
  
  // Reset quiz
  const resetQuiz = () => {
    setQuizState({
      currentQuestion: 0,
      selectedAnswer: null,
      showFeedback: false,
      correct: false,
      completed: false,
      score: 0
    });
    setShowQuiz(false);
  };
  
  // Simulate kernel execution steps
  useEffect(() => {
    if (isRunning) {
      animationRef.current = setInterval(() => {
        setExecutionStep((prevStep) => {
          const nextStep = prevStep + 1;
          if (nextStep > 5) {
            setIsRunning(false);
            return 0;
          }
          return nextStep;
        });
        
        // Simulate thread selection for visualization
        const totalThreads = threadConfig.gridDim.x * threadConfig.gridDim.y * 
                            threadConfig.blockDim.x * threadConfig.blockDim.y;
        const randomThreads = Array(4).fill().map(() => 
          Math.floor(Math.random() * totalThreads)
        );
        setSelectedThreads(randomThreads);
        
        // Simulate memory access patterns
        if (activeTab === 'memory') {
          const memPatterns = [];
          for (let i = 0; i < 8; i++) {
            const type = ['read', 'write'][Math.floor(Math.random() * 2)];
            const address = Math.floor(Math.random() * 32);
            memPatterns.push({ type, address, threadId: Math.floor(Math.random() * 16) });
          }
          setMemoryAccess(memPatterns);
        }
      }, 1000);
    }
    
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isRunning, threadConfig, activeTab]);

  // Thread Hierarchy Tab Content
  const renderThreadHierarchyTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-semibold">Thread Configuration</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Grid Dimensions</label>
            <div className="flex space-x-2">
              <div>
                <label className="block text-xs">X</label>
                <input 
                  type="number" 
                  min="1" 
                  max="8" 
                  className="w-12 h-8 text-center border rounded"
                  value={threadConfig.gridDim.x}
                  onChange={(e) => handleThreadConfigChange('gridDim', 'x', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs">Y</label>
                <input 
                  type="number" 
                  min="1" 
                  max="8" 
                  className="w-12 h-8 text-center border rounded"
                  value={threadConfig.gridDim.y}
                  onChange={(e) => handleThreadConfigChange('gridDim', 'y', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs">Z</label>
                <input 
                  type="number" 
                  min="1" 
                  max="8" 
                  className="w-12 h-8 text-center border rounded"
                  value={threadConfig.gridDim.z}
                  onChange={(e) => handleThreadConfigChange('gridDim', 'z', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Block Dimensions</label>
            <div className="flex space-x-2">
              <div>
                <label className="block text-xs">X</label>
                <input 
                  type="number" 
                  min="1" 
                  max="8" 
                  className="w-12 h-8 text-center border rounded"
                  value={threadConfig.blockDim.x}
                  onChange={(e) => handleThreadConfigChange('blockDim', 'x', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs">Y</label>
                <input 
                  type="number" 
                  min="1" 
                  max="8" 
                  className="w-12 h-8 text-center border rounded"
                  value={threadConfig.blockDim.y}
                  onChange={(e) => handleThreadConfigChange('blockDim', 'y', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs">Z</label>
                <input 
                  type="number" 
                  min="1" 
                  max="8" 
                  className="w-12 h-8 text-center border rounded"
                  value={threadConfig.blockDim.z}
                  onChange={(e) => handleThreadConfigChange('blockDim', 'z', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-end space-x-2">
            <button 
              className={`px-4 py-2 rounded flex items-center ${isRunning ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
              onClick={toggleSimulation}
            >
              {isRunning ? <><Pause size={16} className="mr-1" /> Pause</> : <><Play size={16} className="mr-1" /> Start</>}
            </button>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded flex items-center"
              onClick={() => setShowTutorial(true)}
            >
              <Info size={16} className="mr-1" /> Tutorial
            </button>
          </div>
        </div>
      </div>
      
      <div className="border rounded p-4 bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Thread Hierarchy Visualization</h3>
        <div className="grid grid-cols-1 gap-6">
          {/* Grid of blocks */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Grid (Blocks)</div>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: threadConfig.gridDim.x * threadConfig.gridDim.y }).map((_, blockIdx) => {
                const blockX = blockIdx % threadConfig.gridDim.x;
                const blockY = Math.floor(blockIdx / threadConfig.gridDim.x);
                
                return (
                  <div 
                    key={blockIdx} 
                    className={`border-2 ${executionStep === 1 || blockIdx === selectedThreads[0] % (threadConfig.gridDim.x * threadConfig.gridDim.y) ? 'border-blue-500 bg-blue-100' : 'border-gray-300'} p-2 rounded`}
                  >
                    <div className="text-xs font-medium text-center">
                      Block ({blockX}, {blockY})
                    </div>
                    <div className="grid grid-cols-4 gap-1 mt-1">
                      {Array.from({ length: threadConfig.blockDim.x * threadConfig.blockDim.y }).map((_, threadIdx) => {
                        const threadX = threadIdx % threadConfig.blockDim.x;
                        const threadY = Math.floor(threadIdx / threadConfig.blockDim.x);
                        const globalThreadIdx = (blockIdx * threadConfig.blockDim.x * threadConfig.blockDim.y) + threadIdx;
                        
                        return (
                          <div 
                            key={threadIdx} 
                            className={`w-6 h-6 ${selectedThreads.includes(globalThreadIdx) ? 'bg-green-500' : 'bg-gray-200'} rounded-sm flex items-center justify-center text-xs`}
                            title={`Thread (${threadX}, ${threadY})`}
                          >
                            {threadIdx}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Thread information */}
          <div className="bg-white border rounded p-3">
            <h4 className="text-sm font-medium mb-2">Thread Indices</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-mono bg-gray-100 p-2 rounded">
                  <div>blockIdx.x = {Math.floor(selectedThreads[0] / (threadConfig.blockDim.x * threadConfig.blockDim.y)) % threadConfig.gridDim.x}</div>
                  <div>blockIdx.y = {Math.floor(selectedThreads[0] / (threadConfig.blockDim.x * threadConfig.blockDim.y * threadConfig.gridDim.x))}</div>
                  <div>blockDim.x = {threadConfig.blockDim.x}</div>
                  <div>blockDim.y = {threadConfig.blockDim.y}</div>
                </div>
              </div>
              <div>
                <div className="font-mono bg-gray-100 p-2 rounded">
                  <div>threadIdx.x = {selectedThreads[0] ? selectedThreads[0] % threadConfig.blockDim.x : 0}</div>
                  <div>threadIdx.y = {selectedThreads[0] ? Math.floor((selectedThreads[0] % (threadConfig.blockDim.x * threadConfig.blockDim.y)) / threadConfig.blockDim.x) : 0}</div>
                  <div>gridDim.x = {threadConfig.gridDim.x}</div>
                  <div>gridDim.y = {threadConfig.gridDim.y}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Memory Architecture Tab Content
  const renderMemoryTab = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 mb-4">
        <button 
          className={`px-3 py-1 rounded text-sm ${memoryType === 'shared' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMemoryType('shared')}
        >
          Shared Memory
        </button>
        <button 
          className={`px-3 py-1 rounded text-sm ${memoryType === 'global' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMemoryType('global')}
        >
          Global Memory
        </button>
        <button 
          className={`px-3 py-1 rounded text-sm ${memoryType === 'local' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMemoryType('local')}
        >
          Local Memory
        </button>
        <button 
          className={`px-3 py-1 rounded text-sm ${memoryType === 'constant' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMemoryType('constant')}
        >
          Constant Memory
        </button>
        <button 
          className={`px-3 py-1 rounded text-sm ${memoryType === 'texture' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMemoryType('texture')}
        >
          Texture Memory
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 bg-white border rounded p-4">
          <h3 className="text-lg font-semibold mb-2 capitalize">{memoryType} Memory</h3>
          
          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Properties:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {memoryType === 'global' && (
                <>
                  <li>Accessible by all threads from any block</li>
                  <li>Largest but slowest memory</li>
                  <li>Persists for the lifetime of the application</li>
                  <li>Used for data transfer between host and device</li>
                </>
              )}
              {memoryType === 'shared' && (
                <>
                  <li>Accessible by all threads within a block</li>
                  <li>Much faster than global memory</li>
                  <li>Limited size (typically 48KB per SM)</li>
                  <li>Useful for inter-thread communication</li>
                </>
              )}
              {memoryType === 'local' && (
                <>
                  <li>Private to each thread</li>
                  <li>Automatically allocated for local variables</li>
                  <li>Physically resides in global memory</li>
                  <li>Used for thread-specific data</li>
                </>
              )}
              {memoryType === 'constant' && (
                <>
                  <li>Read-only for all threads</li>
                  <li>Cached for efficient access</li>
                  <li>Limited size (typically 64KB)</li>
                  <li>Best for values used by all threads</li>
                </>
              )}
              {memoryType === 'texture' && (
                <>
                  <li>Optimized for 2D spatial locality</li>
                  <li>Cached for efficient access</li>
                  <li>Read-only in kernel code</li>
                  <li>Useful for image processing</li>
                </>
              )}
            </ul>
          </div>
        </div>
        
        <div className="col-span-2 bg-white border rounded p-4">
          <h3 className="text-lg font-semibold mb-4">Memory Access Visualization</h3>
          
          <div className="flex space-x-4">
            <div className="w-1/2">
              <h4 className="text-sm font-medium mb-2">Memory Blocks</h4>
              <div className="grid grid-cols-8 gap-1">
                {Array.from({ length: 32 }).map((_, i) => {
                  const access = memoryAccess.find(a => a.address === i);
                  let bgColor = 'bg-gray-200';
                  if (access) {
                    bgColor = access.type === 'read' ? 'bg-blue-200' : 'bg-green-200';
                  }
                  
                  return (
                    <div 
                      key={i} 
                      className={`h-8 ${bgColor} flex items-center justify-center rounded text-xs font-mono border`}
                      title={access ? `${access.type.toUpperCase()} by Thread ${access.threadId}` : `Memory Address ${i}`}
                    >
                      {i}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="w-1/2">
              <h4 className="text-sm font-medium mb-2">Access Patterns</h4>
              <div className="space-y-1 text-sm font-mono bg-gray-100 p-2 rounded h-64 overflow-y-auto">
                {memoryAccess.map((access, idx) => (
                  <div key={idx} className={`${access.type === 'read' ? 'text-blue-600' : 'text-green-600'}`}>
                    Thread {access.threadId} {access.type === 'read' ? 'reads from' : 'writes to'} address {access.address}
                  </div>
                ))}
                {memoryAccess.length === 0 && (
                  <div className="text-gray-500">No memory accesses recorded yet. Start the simulation to see access patterns.</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm bg-yellow-50 p-2 rounded border border-yellow-200">
            <p><strong>Performance Tip:</strong> {
              memoryType === 'global' ? 'Coalesced memory access patterns can dramatically improve performance by reducing memory transactions.' :
              memoryType === 'shared' ? 'Using shared memory for frequently accessed data can improve performance by reducing global memory traffic.' :
              memoryType === 'local' ? 'Excessive use of local memory can lead to register spilling and performance degradation.' :
              memoryType === 'constant' ? 'Constant memory is best for values accessed by all threads in a warp simultaneously.' :
              'Texture memory provides hardware-accelerated interpolation and boundary handling for 2D access patterns.'
            }</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Kernel Execution Tab Content
  const renderKernelTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border rounded p-4">
          <h3 className="text-lg font-semibold mb-2">Kernel Code</h3>
          <div className="relative">
            <textarea 
              className="w-full h-40 p-2 font-mono text-sm bg-gray-50 border rounded" 
              value={kernelCode}
              onChange={handleCodeChange}
            />
          </div>
          <div className="mt-4 flex space-x-2">
            <button 
              className={`px-4 py-2 rounded flex items-center ${isRunning ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
              onClick={toggleSimulation}
            >
              {isRunning ? <><Pause size={16} className="mr-1" /> Pause</> : <><Play size={16} className="mr-1" /> Execute Kernel</>}
            </button>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded flex items-center"
              onClick={() => setExecutionStep(0)}
            >
              Reset
            </button>
          </div>
        </div>
        
        <div className="bg-white border rounded p-4">
          <h3 className="text-lg font-semibold mb-2">Execution Visualization</h3>
          <div className="space-y-4">
            <div className="h-40 bg-gray-50 border rounded p-2 font-mono text-sm overflow-y-auto">
              {executionStep === 0 && <div className="text-gray-500">Press "Execute Kernel" to start simulation.</div>}
              {executionStep >= 1 && <div className="text-green-600">Kernel launched with grid dimensions: ({threadConfig.gridDim.x}, {threadConfig.gridDim.y}, {threadConfig.gridDim.z})</div>}
              {executionStep >= 2 && <div className="text-green-600">Block dimensions: ({threadConfig.blockDim.x}, {threadConfig.blockDim.y}, {threadConfig.blockDim.z})</div>}
              {executionStep >= 3 && <div className="text-blue-600">Executing thread blocks on available SMs...</div>}
              {executionStep >= 4 && <div className="text-blue-600">Vector addition in progress...</div>}
              {executionStep >= 5 && (
                <>
                  <div className="text-blue-600">Threads synchronized at block level</div>
                  <div className="text-green-600">Kernel execution completed successfully!</div>
                </>
              )}
            </div>
            
            <div className="bg-yellow-50 p-2 rounded border border-yellow-200 text-sm">
              <p><strong>Current Step:</strong> {executionStep === 0 ? 'Ready to execute' : 
                executionStep === 1 ? 'Kernel launch' :
                executionStep === 2 ? 'Thread block allocation' :
                executionStep === 3 ? 'Thread execution' :
                executionStep === 4 ? 'Memory operations' : 'Synchronization and completion'}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white border rounded p-4">
        <h3 className="text-lg font-semibold mb-2">Thread Synchronization</h3>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, blockIdx) => (
            <div key={blockIdx} className="border rounded p-2">
              <div className="text-sm font-medium mb-2">Block {blockIdx}</div>
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: 16 }).map((_, threadIdx) => {
                  const globalThreadIdx = (blockIdx * 16) + threadIdx;
                  const isSelected = selectedThreads.includes(globalThreadIdx);
                  const isExecuting = executionStep >= 3 && executionStep <= 4;
                  let bgColor = 'bg-gray-200';
                  if (isSelected && isExecuting) {
                    bgColor = 'bg-green-500';
                  } else if (executionStep === 5) {
                    bgColor = 'bg-blue-200';
                  }
                  
                  return (
                    <div 
                      key={threadIdx} 
                      className={`w-6 h-6 ${bgColor} rounded-sm flex items-center justify-center text-xs`}
                    >
                      {threadIdx}
                    </div>
                  );
                })}
              </div>
              {executionStep === 5 && (
                <div className="mt-2 text-xs text-center text-green-600">
                  __syncthreads()
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-sm">
          <p><strong>Note:</strong> The <code>__syncthreads()</code> barrier ensures all threads in a block reach this point before continuing execution. This is essential for avoiding race conditions when using shared memory.</p>
        </div>
      </div>
    </div>
  );

  // Streaming Multiprocessors Tab Content
  const renderSMsTab = () => (
    <div className="space-y-6">
      <div className="bg-white border rounded p-4">
        <h3 className="text-lg font-semibold mb-4">Streaming Multiprocessors (SMs)</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-2">GPU Architecture</h4>
            <div className="border-2 border-gray-300 rounded p-3 bg-gray-50">
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, smIdx) => {
                  const isActive = isRunning && (executionStep >= 3);
                  
                  return (
                    <div 
                      key={smIdx} 
                      className={`border-2 ${isActive ? 'border-green-500 bg-green-50' : 'border-gray-300'} rounded p-2`}
                    >
                      <div className="text-sm font-medium mb-2">SM {smIdx}</div>
                      <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: 4 }).map((_, warpIdx) => {
                          const warpActive = isActive && (Math.random() > 0.3);
                          
                          return (
                            <div 
                              key={warpIdx} 
                              className={`rounded p-1 ${warpActive ? 'bg-blue-200' : 'bg-gray-200'}`}
                            >
                              <div className="text-xs font-medium">Warp {warpIdx}</div>
                              <div className="grid grid-cols-8 gap-0.5 mt-1">
                                {Array.from({ length: 8 }).map((_, threadIdx) => (
                                  <div 
                                    key={threadIdx} 
                                    className={`w-3 h-3 ${warpActive ? 'bg-blue-500' : 'bg-gray-300'} rounded-sm`}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 text-sm">
                <p><strong>Legend:</strong></p>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></div>
                    <span className="text-xs">Active Thread</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-300 rounded-sm mr-1"></div>
                    <span className="text-xs">Inactive Thread</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Warp Execution</h4>
            <div className="bg-white border rounded p-3">
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium mb-1">Instruction Execution</div>
                  <div className="bg-gray-50 p-2 rounded border text-sm font-mono">
                    {isRunning ? (
                      <>
                        <div className="text-green-600">Warp 0: Executing {executionStep > 3 ? 'memory operation' : 'arithmetic operation'}</div>
                        <div className="text-green-600">Warp 1: {executionStep > 2 ? 'Executing arithmetic operation' : 'Waiting for scheduler'}</div>
                        <div className="text-blue-600">Warp 2: {executionStep > 4 ? 'Executing memory operation' : 'Waiting for resources'}</div>
                        <div className="text-gray-500">Warp 3: Idle</div>
                      </>
                    ) : (
                      <div className="text-gray-500">Start simulation to see warp execution.</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">SIMT Execution</div>
                  <div className="bg-gray-50 p-2 rounded border">
                    <div className="w-full bg-gray-200 h-6 rounded overflow-hidden relative">
                      {isRunning && (
                        <>
                          <div className="absolute top-0 left-0 bg-green-500 h-full" style={{ width: '75%' }}></div>
                          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs font-medium">
                            Active Threads: 24/32 (75% Efficiency)
                          </div>
                        </>
                      )}
                      {!isRunning && (
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs font-medium">
                          Start simulation to see SIMT efficiency
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-sm bg-yellow-50 p-2 rounded border border-yellow-200">
                <p><strong>Warp Divergence:</strong> When threads in a warp take different execution paths (e.g., due to conditional statements), the warp must execute both paths serially, reducing efficiency.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white border rounded p-4">
        <h3 className="text-lg font-semibold mb-2">Memory Coalescing</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Coalesced Access</h4>
            <div className="border rounded p-2 bg-gray-50">
              <div className="flex items-center space-x-1 mb-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="text-xs text-center w-8">T{i}</div>
                ))}
              </div>
              
              <div className="flex items-center space-x-1 mb-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-8 h-8 bg-blue-200 border border-blue-400 rounded flex items-center justify-center text-xs">
                    {i*4}
                  </div>
                ))}
              </div>
              
              <div className="h-4 bg-green-500 rounded mt-2 relative">
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs text-white font-medium">
                  1 Memory Transaction
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Uncoalesced Access</h4>
            <div className="border rounded p-2 bg-gray-50">
              <div className="flex items-center space-x-1 mb-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="text-xs text-center w-8">T{i}</div>
                ))}
              </div>
              
              <div className="flex items-center space-x-1 mb-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-8 h-8 bg-red-200 border border-red-400 rounded flex items-center justify-center text-xs">
                    {i*16 + 4}
                  </div>
                ))}
              </div>
              
              <div className="h-4 bg-red-500 rounded mt-2 relative">
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs text-white font-medium">
                  8 Memory Transactions
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-sm">
          <p><strong>Memory Coalescing:</strong> When threads in a warp access contiguous memory locations, these accesses can be combined into a single memory transaction, dramatically improving performance.</p>
        </div>
      </div>
    </div>
  );

  // Learning Modules Tab Content
  const renderLearningTab = () => (
    <div className="space-y-6">
      <div className="bg-white border rounded p-4">
        <h3 className="text-lg font-semibold mb-4">Interactive Tutorials</h3>
        <div className="grid grid-cols-2 gap-4">
          {tutorials.map((tutorial, idx) => (
            <div 
              key={idx}
              className="border rounded p-3 hover:bg-blue-50 cursor-pointer transition-colors"
              onClick={() => {
                setCurrentTutorial(idx);
                setShowTutorial(true);
              }}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                  {idx + 1}
                </div>
                <h4 className="text-lg font-medium">{tutorial.title}</h4>
              </div>
              <p className="mt-2 text-sm text-gray-600">{tutorial.content.substring(0, 80)}...</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white border rounded p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Test Your Knowledge</h3>
          <button 
            className="px-4 py-2 bg-green-500 text-white rounded flex items-center"
            onClick={() => setShowQuiz(true)}
          >
            <Award size={16} className="mr-1" /> Start Quiz
          </button>
        </div>
        
        <div className="text-sm">
          <p>Take a short quiz to test your understanding of CUDA concepts. The quiz covers:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Thread hierarchy and organization</li>
            <li>Memory types and their characteristics</li>
            <li>Kernel execution model</li>
            <li>Warps and streaming multiprocessors</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-white border rounded p-4">
        <h3 className="text-lg font-semibold mb-2">Additional Resources</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              <ArrowRight size={14} className="text-blue-500" />
            </div>
            <p>NYU Introduction to GPUs: CUDA Lesson</p>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              <ArrowRight size={14} className="text-blue-500" />
            </div>
            <p>NVIDIA CUDA Programming Guide</p>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              <ArrowRight size={14} className="text-blue-500" />
            </div>
            <p>University of Toronto CUDA Programming Resources</p>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Tutorial Modal
  const renderTutorialModal = () => (
    showTutorial && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{tutorials[currentTutorial].title}</h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowTutorial(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4">
              {currentTutorial === 0 && (
                <>
                  <p>{tutorials[currentTutorial].content}</p>
                  <div className="bg-gray-50 p-4 rounded border">
                    <h4 className="font-medium mb-2">Thread Hierarchy</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="w-full h-24 bg-blue-100 border border-blue-300 rounded flex items-center justify-center mb-2">
                          <div className="text-sm font-medium">Thread</div>
                        </div>
                        <p className="text-sm">Individual execution unit</p>
                      </div>
                      <div className="text-center">
                        <div className="w-full h-24 bg-green-100 border border-green-300 rounded flex items-center justify-center mb-2">
                          <div className="text-sm font-medium">Block</div>
                        </div>
                        <p className="text-sm">Group of threads that can cooperate</p>
                      </div>
                      <div className="text-center">
                        <div className="w-full h-24 bg-purple-100 border border-purple-300 rounded flex items-center justify-center mb-2">
                          <div className="text-sm font-medium">Grid</div>
                        </div>
                        <p className="text-sm">Array of blocks</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
                    <p><strong>Key Point:</strong> Each thread has unique indices (<code>threadIdx</code>, <code>blockIdx</code>) that allow it to work on different data while executing the same code.</p>
                  </div>
                </>
              )}
              
              {currentTutorial === 1 && (
                <>
                  <p>{tutorials[currentTutorial].content}</p>
                  <div className="bg-gray-50 p-4 rounded border">
                    <h4 className="font-medium mb-2">Memory Hierarchy</h4>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 text-left">Memory Type</th>
                          <th className="p-2 text-left">Scope</th>
                          <th className="p-2 text-left">Lifetime</th>
                          <th className="p-2 text-left">Speed</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-2">Global</td>
                          <td className="p-2">All threads</td>
                          <td className="p-2">Application</td>
                          <td className="p-2">Slow</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">Shared</td>
                          <td className="p-2">Block</td>
                          <td className="p-2">Block</td>
                          <td className="p-2">Fast</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">Local</td>
                          <td className="p-2">Thread</td>
                          <td className="p-2">Thread</td>
                          <td className="p-2">Medium</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">Constant</td>
                          <td className="p-2">All threads (read-only)</td>
                          <td className="p-2">Application</td>
                          <td className="p-2">Fast (cached)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
                    <p><strong>Key Point:</strong> Using the right memory type for your data access pattern can dramatically impact performance.</p>
                  </div>
                </>
              )}
              
              {currentTutorial === 2 && (
                <>
                  <p>{tutorials[currentTutorial].content}</p>
                  <div className="bg-gray-50 p-4 rounded border">
                    <h4 className="font-medium mb-2">Kernel Execution Model</h4>
                    <div className="space-y-2 text-sm">
                      <p>A kernel function is defined with the <code>__global__</code> keyword:</p>
                      <div className="bg-gray-100 p-2 rounded font-mono">
                        __global__ void vectorAdd(float *a, float *b, float *c) &#123;<br />
                        &nbsp;&nbsp;int i = blockIdx.x * blockDim.x + threadIdx.x;<br />
                        &nbsp;&nbsp;c[i] = a[i] + b[i];<br />
                        &#125;
                      </div>
                      <p className="mt-2">It is launched with a grid and block configuration:</p>
                      <div className="bg-gray-100 p-2 rounded font-mono">
                        vectorAdd&lt;&lt;&lt;gridDim, blockDim&gt;&gt;&gt;(d_a, d_b, d_c);
                      </div>
                    </div>
                  </div>
                  <div className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
                    <p><strong>Key Point:</strong> All threads execute the same kernel code, but operate on different data based on their unique thread and block indices.</p>
                  </div>
                </>
              )}
              
              {currentTutorial === 3 && (
                <>
                  <p>{tutorials[currentTutorial].content}</p>
                  <div className="bg-gray-50 p-4 rounded border">
                    <h4 className="font-medium mb-2">Warps and SMs</h4>
                    <div className="space-y-2 text-sm">
                      <p>GPU hardware executes threads in groups of 32 called "warps":</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Threads in a warp execute the same instruction simultaneously (SIMT model)</li>
                        <li>Warps are scheduled and executed on Streaming Multiprocessors (SMs)</li>
                        <li>When threads in a warp take different paths (branch divergence), execution is serialized</li>
                        <li>Memory coalescing: When threads in a warp access adjacent memory locations, accesses can be combined into a single transaction</li>
                      </ul>
                    </div>
                  </div>
                  <div className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
                    <p><strong>Key Point:</strong> Understanding warp execution is crucial for optimizing CUDA code. Avoid branch divergence and ensure coalesced memory access within warps.</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={nextTutorial}
              >
                {currentTutorial < tutorials.length - 1 ? 'Next' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
  
  // Quiz Modal
  const renderQuizModal = () => (
    showQuiz && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-xl w-full max-h-[80vh] overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">CUDA Concepts Quiz</h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowQuiz(false)}
              >
                &times;
              </button>
            </div>
            
            {quizState.completed ? (
              <div className="text-center py-4">
                <div className="text-2xl font-bold mb-2">Quiz Complete!</div>
                <div className="text-xl">Your Score: {quizState.score}/{quizQuestions.length}</div>
                <div className="mt-6">
                  <button 
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={resetQuiz}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4 text-sm text-gray-500">
                  Question {quizState.currentQuestion + 1} of {quizQuestions.length}
                </div>
                
                <div className="mb-4">
                  <h4 className="text-lg font-medium mb-3">{quizQuestions[quizState.currentQuestion].question}</h4>
                  <div className="space-y-2">
                    {quizQuestions[quizState.currentQuestion].options.map((option, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 border rounded cursor-pointer transition-colors ${
                          quizState.selectedAnswer === idx
                            ? quizState.showFeedback
                              ? idx === quizQuestions[quizState.currentQuestion].answer
                                ? 'bg-green-100 border-green-500'
                                : 'bg-red-100 border-red-500'
                              : 'bg-blue-100 border-blue-500'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => selectAnswer(idx)}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
                
                {quizState.showFeedback && (
                  <div className={`p-3 rounded mb-4 ${quizState.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {quizState.correct ? 'Correct!' : 'Incorrect.'} 
                    {!quizState.correct && (
                      <span> The correct answer is: {quizQuestions[quizState.currentQuestion].options[quizQuestions[quizState.currentQuestion].answer]}.</span>
                    )}
                  </div>
                )}
                
                <div className="flex justify-end">
                  {quizState.showFeedback && (
                    <button 
                      className="px-4 py-2 bg-blue-500 text-white rounded"
                      onClick={nextQuestion}
                    >
                      {quizState.currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'See Results'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">CUDA Architecture Simulator</h1>
          <p className="text-gray-600">An interactive web application to understand NVIDIA's CUDA parallel computing platform</p>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex border-b">
            <button 
              className={`px-4 py-3 text-sm font-medium flex items-center ${activeTab === 'threadHierarchy' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('threadHierarchy')}
            >
              <Grid3X3 size={16} className="mr-1" /> Thread Hierarchy
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium flex items-center ${activeTab === 'memory' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('memory')}
            >
              <HardDrive size={16} className="mr-1" /> Memory Architecture
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium flex items-center ${activeTab === 'kernel' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('kernel')}
            >
              <Play size={16} className="mr-1" /> Kernel Execution
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium flex items-center ${activeTab === 'sms' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('sms')}
            >
              <Cpu size={16} className="mr-1" /> SMs & Warps
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium flex items-center ${activeTab === 'learning' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('learning')}
            >
              <Award size={16} className="mr-1" /> Learning Modules
            </button>
          </div>
          
          <div className="p-6">
            {activeTab === 'threadHierarchy' && renderThreadHierarchyTab()}
            {activeTab === 'memory' && renderMemoryTab()}
            {activeTab === 'kernel' && renderKernelTab()}
            {activeTab === 'sms' && renderSMsTab()}
            {activeTab === 'learning' && renderLearningTab()}
          </div>
        </div>
      </div>
      
      {renderTutorialModal()}
      {renderQuizModal()}
    </div>
  );
}