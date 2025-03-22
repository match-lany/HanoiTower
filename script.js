/**
 * 汉诺塔游戏
 * 一个响应式的汉诺塔网页游戏实现，支持多种设备和屏幕尺寸。
 * 功能包括：圆盘数量选择、移动计数、游戏完成检测和庆祝动画。
 */
document.addEventListener('DOMContentLoaded', () => {
    // ==================
    // DOM元素引用
    // ==================
    const diskCountInput = document.getElementById('diskCount');
    const diskButtons = document.querySelectorAll('.disk-button');
    const restartButton = document.getElementById('restart');
    const moveCountElement = document.getElementById('moveCount');
    const messageElement = document.getElementById('message');
    const messageCloneElement = document.getElementById('message-clone');
    const towers = [
        document.getElementById('tower1'),
        document.getElementById('tower2'),
        document.getElementById('tower3')
    ];
    const disksContainers = [
        towers[0].querySelector('.disks'),
        towers[1].querySelector('.disks'),
        towers[2].querySelector('.disks')
    ];
    
    // 音效元素
    const moveSound = document.getElementById('moveSound');
    const errorSound = document.getElementById('errorSound');
    const victorySound = document.getElementById('victorySound');
    const perfectSound = document.getElementById('perfectSound');
    
    // 庆祝动画容器
    const celebrationContainer = document.getElementById('celebration');
    const perfectCelebrationContainer = document.getElementById('perfectCelebration');
    
    // ==================
    // 游戏状态变量
    // ==================
    let diskCount = 3; // 默认3个圆盘
    let moveCount = 0;
    let selectedDisk = null;
    let selectedTower = null;
    let gameCompleted = false;
    let gameStarted = false;

    /**
     * 初始化圆盘选择按钮
     * 设置激活状态和禁用状态，根据当前游戏状态更新按钮UI
     */
    function initDiskButtons() {
        // 先清除所有active状态
        diskButtons.forEach(button => {
            button.classList.remove('active');
            button.classList.remove('disabled');
        });
        
        // 设置当前选中的按钮
        const activeButton = Array.from(diskButtons).find(button => 
            parseInt(button.dataset.value) === diskCount
        );
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // 如果游戏已经开始，禁用所有按钮
        if (gameStarted && !gameCompleted) {
            diskButtons.forEach(button => {
                button.classList.add('disabled');
            });
        }
    }

    /**
     * 播放音效
     * @param {HTMLAudioElement} sound - 要播放的音效元素
     */
    function playSound(sound) {
        // 重置音频以便可以连续播放
        sound.currentTime = 0;
        sound.play().catch(error => {
            console.log('Audio play failed:', error);
        });
    }
    
    /**
     * 创建庆祝动画
     * 根据是否完美通关创建不同的庆祝效果
     * @param {boolean} isPerfect - 是否是完美通关（最少步数）
     */
    function createCelebration(isPerfect = false) {
        const container = isPerfect ? perfectCelebrationContainer : celebrationContainer;
        container.innerHTML = ''; // 清空现有内容
        container.style.display = 'block';
        
        // 根据是否完美决定数量和元素类型
        const elementCount = isPerfect ? 150 : 50; // 完美通关时粒子数量更多
        
        /**
         * 创建持续产生新粒子的循环动画
         * 定期产生新的庆祝元素，实现持续的庆祝效果
         */
        function generateParticles() {
            // 清除部分旧粒子以避免过多DOM元素
            const oldElements = container.querySelectorAll('.confetti, .star, .perfect-icon');
            if (oldElements.length > (isPerfect ? 400 : 300)) {
                for (let i = 0; i < elementCount / 3; i++) {
                    if (oldElements[i]) oldElements[i].remove();
                }
            }
            
            // 创建新粒子
            for (let i = 0; i < elementCount / 3; i++) {
                // 创建纸屑或星星
                const element = document.createElement('div');
                
                // 完美通关的特殊效果
                if (isPerfect) {
                    // 随机选择特殊效果类型
                    const perfectEffectType = Math.random();
                    
                    if (perfectEffectType < 0.3) {
                        // 创建星星
                        element.className = 'star';
                        element.style.backgroundColor = getRandomColor(true); // 更亮的颜色
                        element.style.width = `${getRandomFloat(15, 25)}px`; // 更大的星星
                        element.style.height = `${getRandomFloat(15, 25)}px`;
                        element.style.animation = `twinkle ${getRandomFloat(1, 2)}s infinite alternate, fall ${getRandomFloat(4, 8)}s ${getRandomFloat(0, 3)}s forwards`;
                    } else if (perfectEffectType < 0.5) {
                        // 创建特殊图标 (奖杯、星星、皇冠等)
                        element.className = 'perfect-icon';
                        const icons = ['🏆', '⭐', '👑', '🎉', '🎊', '🥇', '💯', '✨'];
                        element.textContent = icons[Math.floor(Math.random() * icons.length)];
                        element.style.fontSize = `${getRandomFloat(20, 36)}px`;
                        element.style.animation = `spin ${getRandomFloat(3, 6)}s linear infinite, fall ${getRandomFloat(5, 10)}s ${getRandomFloat(0, 3)}s forwards`;
                    } else {
                        // 创建彩色纸屑
                        element.className = 'confetti';
                        element.style.backgroundColor = getRandomColor(true);
                        element.style.width = `${getRandomFloat(8, 18)}px`;
                        element.style.height = `${getRandomFloat(8, 18)}px`;
                        element.style.animation = `${Math.random() > 0.5 ? 'spin' : 'flutter'} ${getRandomFloat(2, 4)}s linear infinite, fall ${getRandomFloat(3, 7)}s ${getRandomFloat(0, 2)}s forwards`;
                    }
                } else {
                    // 普通通关的简单效果
                    if (Math.random() > 0.8) {
                        element.className = 'star';
                        element.style.backgroundColor = getRandomColor(false);
                        element.style.animation = `twinkle ${getRandomFloat(1, 2)}s infinite alternate, fall ${getRandomFloat(3, 6)}s ${getRandomFloat(0, 3)}s forwards`;
                    } else {
                        element.className = 'confetti';
                        element.style.backgroundColor = getRandomColor(false);
                        element.style.width = `${getRandomFloat(5, 12)}px`;
                        element.style.height = `${getRandomFloat(5, 12)}px`;
                        element.style.animation = `fall ${getRandomFloat(2, 5)}s ${getRandomFloat(0, 2)}s forwards`;
                    }
                }
                
                // 设置起始位置
                element.style.left = `${getRandomFloat(0, 100)}%`;
                element.style.opacity = '0';
                
                container.appendChild(element);
            }
            
            // 完美通关时添加特殊背景闪光效果
            if (isPerfect && Math.random() > 0.7) {
                const flash = document.createElement('div');
                flash.className = 'background-flash';
                flash.style.backgroundColor = getRandomColor(true, 0.2);
                container.appendChild(flash);
                
                // 短暂显示后删除
                setTimeout(() => {
                    flash.remove();
                }, 1000);
            }
        }
        
        // 初始粒子
        generateParticles();
        
        // 完美通关时添加光环效果在游戏区域
        if (isPerfect) {
            const gameContainer = document.querySelector('.game-container');
            gameContainer.classList.add('perfect-glow');
            
            // 为游戏区域添加脉动效果
            const towers = document.querySelectorAll('.tower');
            towers.forEach(tower => {
                tower.classList.add('tower-perfect');
            });
            
            // 为最后一个塔的所有盘子添加闪烁效果
            const lastTowerDisks = disksContainers[2].querySelectorAll('.disk');
            lastTowerDisks.forEach((disk, index) => {
                disk.style.animation = `disk-shine ${1 + index * 0.2}s ease-in-out infinite alternate`;
            });
        }
        
        // 定期生成新粒子以实现持续的庆祝效果
        const animationInterval = setInterval(generateParticles, isPerfect ? 1000 : 2000);
        
        // 将动画间隔ID存储在游戏状态中，以便在游戏重启时清除
        window.celebrationInterval = animationInterval;
    }
    
    /**
     * 生成随机颜色
     * @param {boolean} isPerfect - 是否为完美通关效果生成更明亮的颜色
     * @param {number} alpha - 透明度值（可选）
     * @returns {string} 颜色值（hex格式或rgba格式）
     */
    function getRandomColor(isPerfect = false, alpha = 1) {
        // 完美通关使用更明亮、更丰富的颜色
        const colors = isPerfect ? [
            '#ff5e7f', '#ff3e88', '#fd2e6b', // 鲜亮红粉
            '#ffdd59', '#ffcd00', '#fcc201', // 亮黄
            '#45fcb1', '#0be881', '#05c46b', // 翠绿
            '#4bcffa', '#0fbcf9', '#0984e3', // 亮蓝
            '#d983ff', '#be2edd', '#8e44ad', // 紫色
            '#ffa502', '#ff7f50', '#ff6348'  // 橙色
        ] : [
            '#ff7675', '#e74c3c', // 红
            '#f39c12', '#e67e22', // 橙
            '#fdcb6e', '#f1c40f', // 黄
            '#55efc4', '#2ecc71', // 绿
            '#81ecec', '#00cec9', // 青
            '#74b9ff', '#0984e3', // 蓝
            '#a29bfe', '#6c5ce7'  // 紫
        ];
        
        if (alpha < 1) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            // 将十六进制颜色转换为rgba
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * 生成指定范围内的随机浮点数
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 生成的随机浮点数
     */
    function getRandomFloat(min, max) {
        return min + Math.random() * (max - min);
    }

    /**
     * 窗口大小变化时调整圆盘尺寸
     * 根据容器宽度自动调整圆盘尺寸，确保在不同设备上的良好显示
     */
    function adjustDiskSizes() {
        const gameContainer = document.querySelector('.game-container');
        const containerWidth = gameContainer.offsetWidth;
        const towerWidth = containerWidth / 3.5; // 留出一些边距
        
        // 根据屏幕宽度确定基础和增量
        let baseWidth, increment;
        
        if (containerWidth < 350) {
            // 非常小的屏幕
            baseWidth = 20;
            increment = 10;
        } else if (containerWidth < 450) {
            // 小屏幕
            baseWidth = 25;
            increment = 12;
        } else if (containerWidth < 600) {
            // 中等屏幕
            baseWidth = 30;
            increment = 13;
        } else {
            // 大屏幕
            baseWidth = 30;
            increment = 15;
        }
        
        // 计算最大圆盘的宽度不应超过塔的宽度
        const maxDiskWidth = Math.min(towerWidth * 0.9, baseWidth + (diskCount * increment));
        
        // 调整所有圆盘尺寸
        const allDisks = document.querySelectorAll('.disk');
        allDisks.forEach(disk => {
            const size = parseInt(disk.dataset.size);
            const width = baseWidth + ((diskCount + 1 - size) * increment);
            disk.style.width = `${width}px`;
        });
    }

    /**
     * 显示游戏消息
     * 在消息区域显示文本信息，同时更新克隆消息区域（用于平板横屏模式）
     * @param {string} text - 要显示的消息文本
     */
    function showMessage(text) {
        // 如果没有文本，清空消息
        if (!text) {
            messageElement.textContent = '';
            messageElement.innerHTML = '';
            messageElement.classList.remove('perfect-message');
            messageElement.classList.remove('error-message');
            
            // 同时更新克隆消息
            if (messageCloneElement) {
                messageCloneElement.textContent = '';
                messageCloneElement.innerHTML = '';
                messageCloneElement.classList.remove('perfect-message');
                messageCloneElement.classList.remove('error-message');
            }
            return;
        }

        // 检查是否完美通关
        const isPerfect = text.includes('完美') || text.includes('最少步数');
        
        // 更新主消息区域
        messageElement.innerHTML = text;
        
        if (isPerfect) {
            messageElement.classList.add('perfect-message');
            
            // 添加装饰元素
            const decoration = document.createElement('div');
            decoration.className = 'message-decoration';
            
            // 添加装饰图标
            const icons = ['🏆', '🎉', '✨', '👑', '🌟'];
            icons.forEach(icon => {
                const span = document.createElement('span');
                span.className = 'decoration-icon';
                span.textContent = icon;
                decoration.appendChild(span);
            });
            
            messageElement.appendChild(decoration);
        } else {
            messageElement.classList.remove('perfect-message');
        }
        
        // 同步更新克隆消息 - 用于平板横屏模式
        if (messageCloneElement) {
            messageCloneElement.innerHTML = messageElement.innerHTML;
            
            if (isPerfect) {
                messageCloneElement.classList.add('perfect-message');
            } else {
                messageCloneElement.classList.remove('perfect-message');
            }
        }
    }

    /**
     * 创建圆盘元素
     * @param {number} size - 圆盘大小(1为最小)
     * @returns {HTMLElement} 创建的圆盘DOM元素
     */
    function createDisk(size) {
        const disk = document.createElement('div');
        disk.className = 'disk';
        disk.dataset.size = size;
        disk.classList.add(`disk-${size}`);
        
        // 调整宽度
        const gameContainer = document.querySelector('.game-container');
        const containerWidth = gameContainer.offsetWidth;
        const towerWidth = containerWidth / 3.5;
        
        let baseWidth, increment;
        
        if (containerWidth < 350) {
            baseWidth = 20;
            increment = 10;
        } else if (containerWidth < 450) {
            baseWidth = 25;
            increment = 12;
        } else if (containerWidth < 600) {
            baseWidth = 30;
            increment = 13;
        } else {
            baseWidth = 30;
            increment = 15;
        }
        
        const width = baseWidth + ((diskCount + 1 - size) * increment);
        disk.style.width = `${width}px`;
        
        return disk;
    }

    /**
     * 初始化游戏
     * 清除现有状态，创建初始圆盘，重置计数器和消息
     */
    function initGame() {
        // 重置状态
        gameStarted = false;
        gameCompleted = false;
        selectedDisk = null;
        selectedTower = null;
        moveCount = 0;
        moveCountElement.textContent = '0';
        
        // 清空塔上的所有圆盘
        disksContainers.forEach(container => {
            container.innerHTML = '';
        });
        
        // 移除高亮和选中状态
        towers.forEach(tower => {
            tower.classList.remove('selected');
            tower.classList.remove('highlight');
        });
        
        // 移除游戏区域的特殊效果
        const gameContainer = document.querySelector('.game-container');
        gameContainer.classList.remove('perfect-glow');
        
        // 移除塔的特殊效果
        const allTowers = document.querySelectorAll('.tower');
        allTowers.forEach(tower => {
            tower.classList.remove('tower-perfect');
        });
        
        // 停止庆祝动画
        celebrationContainer.style.display = 'none';
        perfectCelebrationContainer.style.display = 'none';
        celebrationContainer.innerHTML = '';
        perfectCelebrationContainer.innerHTML = '';
        
        if (window.celebrationInterval) {
            clearInterval(window.celebrationInterval);
            window.celebrationInterval = null;
        }
        
        // 清空消息
        showMessage('');
        
        // 在第一根柱子上添加圆盘
        for (let i = diskCount; i >= 1; i--) {
            disksContainers[0].appendChild(createDisk(i));
        }
        
        // 重置按钮状态
        initDiskButtons();
    }

    /**
     * 选择圆盘
     * 处理塔的点击逻辑，包括选择和移动圆盘
     * @param {number} towerIndex - 塔的索引(0-2)
     */
    function selectDisk(towerIndex) {
        // 如果游戏已完成，不处理点击
        if (gameCompleted) return;
        
        // 游戏开始标记
        if (!gameStarted) {
            gameStarted = true;
            initDiskButtons(); // 更新按钮状态（禁用数量选择）
        }
        
        // 清除所有塔的高亮状态
        towers.forEach(tower => tower.classList.remove('highlight'));
        
        // 如果当前没有选中的圆盘，尝试选择一个
        if (selectedDisk === null) {
            // 检查目标塔是否有圆盘
            const disksInTower = disksContainers[towerIndex].querySelectorAll('.disk');
            if (disksInTower.length === 0) return; // 空塔，不执行操作
            
            // 获取最顶部的圆盘（最后一个子元素）
            const topDisk = disksInTower[disksInTower.length - 1];
            topDisk.classList.add('selected');
            
            // 更新选中状态
            selectedDisk = topDisk;
            selectedTower = towerIndex;
            
            // 高亮当前选中的塔
            towers[towerIndex].classList.add('selected');
            
            // 高亮可以移动到的塔
            for (let i = 0; i < 3; i++) {
                if (i !== towerIndex) {
                    const canMove = canMoveToTower(i);
                    if (canMove) {
                        towers[i].classList.add('highlight');
                    }
                }
            }
        } else {
            // 已经有选中的圆盘，尝试移动
            
            // 如果点击的是当前选中的塔，取消选择
            if (towerIndex === selectedTower) {
                selectedDisk.classList.remove('selected');
                towers[selectedTower].classList.remove('selected');
                selectedDisk = null;
                selectedTower = null;
                return;
            }
            
            // 尝试将圆盘移动到目标塔
            const moveSuccessful = moveDisk(selectedTower, towerIndex);
            
            // 取消选中状态
            if (selectedDisk) {
                selectedDisk.classList.remove('selected');
            }
            towers[selectedTower].classList.remove('selected');
            selectedDisk = null;
            selectedTower = null;
            
            // 如果移动成功，检查游戏是否完成
            if (moveSuccessful) {
                if (checkGameComplete()) {
                    gameCompleted = true;
                    
                    // 计算最少步数
                    const minMoves = calculateMinMoves(diskCount);
                    
                    // 完美通关（最少步数）
                    if (moveCount === minMoves) {
                        showMessage(`恭喜！你完美地完成了游戏，使用了最少步数：${moveCount}步！`);
                        playSound(perfectSound);
                        createCelebration(true); // 特殊的完美通关庆祝效果
                    } else {
                        showMessage(`恭喜！你完成了游戏，总共用了${moveCount}步！(最少步数是${minMoves})`);
                        playSound(victorySound);
                        createCelebration(false); // 普通庆祝效果
                    }
                    
                    // 重新启用按钮选择
                    gameStarted = false;
                    initDiskButtons();
                }
            }
        }
    }

    /**
     * 检查是否可以将当前选中的圆盘移动到目标塔
     * @param {number} targetTower - 目标塔索引
     * @returns {boolean} 是否可以移动
     */
    function canMoveToTower(targetTower) {
        // 获取目标塔上的圆盘
        const disksInTarget = disksContainers[targetTower].querySelectorAll('.disk');
        
        // 如果目标塔为空，可以移动
        if (disksInTarget.length === 0) return true;
        
        // 获取目标塔顶部圆盘的大小
        const topDiskInTarget = disksInTarget[disksInTarget.length - 1];
        const targetSize = parseInt(topDiskInTarget.dataset.size);
        
        // 获取当前选中圆盘的大小
        const selectedSize = parseInt(selectedDisk.dataset.size);
        
        // 只有当选中的圆盘比目标塔顶部圆盘小时才可以移动
        return selectedSize < targetSize;
    }

    /**
     * 移动圆盘
     * @param {number} fromTower - 起始塔索引
     * @param {number} toTower - 目标塔索引
     * @returns {boolean} 移动是否成功
     */
    function moveDisk(fromTower, toTower) {
        // 获取目标塔上的圆盘
        const disksInTarget = disksContainers[toTower].querySelectorAll('.disk');
        
        // 如果目标塔有圆盘，检查是否可以移动
        if (disksInTarget.length > 0) {
            const topDiskInTarget = disksInTarget[disksInTarget.length - 1];
            const targetSize = parseInt(topDiskInTarget.dataset.size);
            const selectedSize = parseInt(selectedDisk.dataset.size);
            
            // 如果选中的圆盘比目标塔顶部圆盘大，不能移动
            if (selectedSize >= targetSize) {
                // 显示错误提示
                showMessage('错误: 不能将大圆盘放在小圆盘上！');
                
                // 播放错误音效
                playSound(errorSound);
                
                // 添加震动效果
                selectedDisk.classList.add('error');
                setTimeout(() => {
                    selectedDisk.classList.remove('error');
                }, 500);
                
                return false;
            }
        }
        
        // 执行移动
        disksContainers[toTower].appendChild(selectedDisk);
        
        // 更新移动次数
        moveCount++;
        moveCountElement.textContent = moveCount;
        
        // 播放移动音效
        playSound(moveSound);
        
        // 清除错误消息
        showMessage('');
        
        return true;
    }

    /**
     * 检查游戏是否完成
     * 所有圆盘都移动到第三根柱子上即为完成
     * @returns {boolean} 游戏是否完成
     */
    function checkGameComplete() {
        // 游戏完成条件: 所有圆盘都在第三根柱子上
        return disksContainers[2].children.length === diskCount;
    }

    /**
     * 计算指定盘子数量的最少移动次数
     * 汉诺塔最少移动次数公式: 2^n - 1
     * @param {number} disks - 盘子数量
     * @returns {number} 最少移动次数
     */
    function calculateMinMoves(disks) {
        return Math.pow(2, disks) - 1;
    }

    // ==================
    // 事件监听器设置
    // ==================
    
    // 圆盘数量按钮点击事件
    diskButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 如果游戏已经开始且未完成，不允许更改盘子数量
            if (gameStarted && !gameCompleted) return;
            
            const newDiskCount = parseInt(button.dataset.value);
            if (newDiskCount !== diskCount) {
                diskCount = newDiskCount;
                diskCountInput.value = diskCount;
                initGame();
            }
        });
    });
    
    // 塔点击事件
    towers.forEach((tower, index) => {
        tower.addEventListener('click', () => {
            selectDisk(index);
        });
    });
    
    // 重新开始按钮点击事件
    restartButton.addEventListener('click', () => {
        initGame();
    });
    
    // 窗口大小变化事件
    window.addEventListener('resize', () => {
        adjustDiskSizes();
    });

    // 初始化游戏
    initGame();
    
    // 调整初始圆盘尺寸
    adjustDiskSizes();
}); 