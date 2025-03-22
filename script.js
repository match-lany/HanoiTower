document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
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
    
    // 获取音效元素
    const moveSound = document.getElementById('moveSound');
    const errorSound = document.getElementById('errorSound');
    const victorySound = document.getElementById('victorySound');
    const perfectSound = document.getElementById('perfectSound');
    
    // 获取庆祝动画容器
    const celebrationContainer = document.getElementById('celebration');
    const perfectCelebrationContainer = document.getElementById('perfectCelebration');
    
    // 游戏状态
    let diskCount = 3; // 默认3个圆盘
    let moveCount = 0;
    let selectedDisk = null;
    let selectedTower = null;
    let gameCompleted = false;
    let gameStarted = false;

    // 初始化圆盘选择按钮
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

    // 播放音效函数
    function playSound(sound) {
        // 重置音频以便可以连续播放
        sound.currentTime = 0;
        sound.play().catch(error => {
            console.log('Audio play failed:', error);
        });
    }
    
    // 创建庆祝动画
    function createCelebration(isPerfect = false) {
        const container = isPerfect ? perfectCelebrationContainer : celebrationContainer;
        container.innerHTML = ''; // 清空现有内容
        container.style.display = 'block';
        
        // 根据是否完美决定数量和元素类型
        const elementCount = isPerfect ? 150 : 50; // 完美通关时粒子数量更多
        
        // 创建持续产生新粒子的循环动画
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
    
    // 生成随机颜色
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
    
    // 生成随机浮点数
    function getRandomFloat(min, max) {
        return min + Math.random() * (max - min);
    }

    // 窗口大小变化时调整圆盘尺寸
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
        
        // 如果最大圆盘太宽，调整增量
        if (baseWidth + (diskCount * increment) > maxDiskWidth) {
            increment = (maxDiskWidth - baseWidth) / diskCount;
        }

        // 检查盘子总高度，确保不超出柱子高度
        const pole = document.querySelector('.pole');
        const poleHeight = pole.offsetHeight;
        const diskHeight = parseInt(window.getComputedStyle(document.querySelector('.disk') || 
                           {height: '24px'}).height) || 24;
        const diskMargin = 2; // 盘子之间的间距 (在CSS中已设置为2px)
        
        // 计算所有盘子的总高度
        const totalDisksHeight = diskCount * (diskHeight + diskMargin);
        
        // 如果总高度超过柱子高度的80%，则调整盘子高度
        if (totalDisksHeight > poleHeight * 0.8) {
            // 计算新的盘子高度和间距
            const maxTotalHeight = poleHeight * 0.8;
            const newDiskHeight = Math.floor((maxTotalHeight / diskCount) - diskMargin);
            
            // 应用新的盘子高度
            document.querySelectorAll('.disk').forEach(disk => {
                disk.style.height = `${newDiskHeight}px`;
            });
        }
        
        // 更新所有圆盘的宽度
        document.querySelectorAll('.disk').forEach(disk => {
            // 从类名中获取圆盘尺寸编号（如disk-color-3中的3）
            const sizeClasses = Array.from(disk.classList)
                .filter(cls => cls.startsWith('disk-color-'));
            
            if (sizeClasses.length > 0) {
                const size = parseInt(sizeClasses[0].split('-')[2]);
                const width = Math.max(baseWidth + (size * increment), baseWidth);
                disk.style.width = `${width}px`;
            }
        });
    }
    
    // 监听窗口大小变化
    window.addEventListener('resize', adjustDiskSizes);
    // 监听设备方向变化
    window.addEventListener('orientationchange', adjustDiskSizes);

    // 初始化游戏
    function initGame() {
        // 重置游戏状态
        moveCount = 0;
        selectedDisk = null;
        selectedTower = null;
        gameCompleted = false;
        gameStarted = false;
        moveCountElement.textContent = '0';
        
        // 清空消息
        messageElement.textContent = '';
        messageElement.classList.remove('perfect-message');
        messageElement.classList.remove('rules-message');
        
        // 移除可能存在的之前的装饰
        const oldDecoration = messageElement.querySelector('.message-decoration');
        if (oldDecoration) {
            oldDecoration.remove();
        }
        
        // 显示游戏规则
        showGameRules();
        
        // 移除游戏区域的完美光环效果
        document.querySelector('.game-container').classList.remove('perfect-glow');
        
        // 移除塔的完美效果
        document.querySelectorAll('.tower').forEach(tower => {
            tower.classList.remove('tower-perfect');
        });
        
        // 更新圆盘选择按钮状态
        initDiskButtons();

        // 清空所有塔
        disksContainers.forEach(container => {
            container.innerHTML = '';
        });

        // 创建圆盘并放在第一个塔上
        for (let i = diskCount; i >= 1; i--) {
            const disk = createDisk(i);
            disksContainers[0].appendChild(disk);
        }

        // 调整圆盘尺寸以适应屏幕
        adjustDiskSizes();

        // 为每个塔添加点击事件
        towers.forEach((tower, index) => {
            tower.onclick = () => handleTowerClick(index);
        });
        
        // 清除现有的庆祝动画间隔
        if (window.celebrationInterval) {
            clearInterval(window.celebrationInterval);
            window.celebrationInterval = null;
        }
        
        // 隐藏庆祝动画容器
        celebrationContainer.style.display = 'none';
        perfectCelebrationContainer.style.display = 'none';
        celebrationContainer.innerHTML = '';
        perfectCelebrationContainer.innerHTML = '';
    }
    
    // 显示游戏规则
    function showGameRules() {
        const rulesText = `<div class="rules-title">🎮 游戏规则 🎮</div>
                          <div class="rules-content">将所有圆盘从左边移到右边，大盘不能放在小盘上面哦！<br>点击柱子选择和放置圆盘。加油！✨</div>`;
        
        // 更新主消息区域
        messageElement.innerHTML = rulesText;
        messageElement.classList.add('rules-message');
        
        // 添加装饰元素
        const decoration = document.createElement('div');
        decoration.className = 'rules-decoration';
        
        // 添加装饰图标
        const icons = ['🎯', '🎲', '🎪', '🎨'];
        icons.forEach(icon => {
            const span = document.createElement('span');
            span.className = 'decoration-icon';
            span.textContent = icon;
            decoration.appendChild(span);
        });
        
        messageElement.appendChild(decoration);
        
        // 同步更新克隆消息 - 用于平板横屏模式
        if (messageCloneElement) {
            messageCloneElement.innerHTML = messageElement.innerHTML;
            messageCloneElement.classList.add('rules-message');
        }
    }

    // 创建一个圆盘
    function createDisk(size) {
        const disk = document.createElement('div');
        disk.className = 'disk';
        // 添加固定颜色类
        disk.classList.add(`disk-color-${size}`);
        
        // 宽度将在adjustDiskSizes中设置
        return disk;
    }

    // 处理塔的点击事件
    function handleTowerClick(towerIndex) {
        if (gameCompleted) return;
        
        // 第一次点击时，游戏开始
        if (!gameStarted) {
            gameStarted = true;
            // 清除规则消息
            showMessage('');
            // 禁用圆盘数量选择按钮
            initDiskButtons();
        }

        const currentTower = disksContainers[towerIndex];
        const topDisk = currentTower.lastElementChild;

        // 如果没有选中圆盘，尝试选择当前塔的顶部圆盘
        if (!selectedDisk) {
            if (!topDisk) {
                showMessage('请选择一个有圆盘的塔');
                return;
            }
            
            selectedDisk = topDisk;
            selectedTower = towerIndex;
            selectedDisk.classList.add('selected');
            return;
        }

        // 如果点击了同一个塔，取消选择
        if (selectedTower === towerIndex) {
            selectedDisk.classList.remove('selected');
            selectedDisk = null;
            selectedTower = null;
            return;
        }

        // 检查移动是否合法 - 使用类名比较尺寸
        if (topDisk) {
            const selectedSize = getDiscSize(selectedDisk);
            const topDiskSize = getDiscSize(topDisk);
            
            if (selectedSize > topDiskSize) {
                showMessage('不能将大圆盘放在小圆盘上');
                selectedDisk.classList.add('error');
                
                // 播放错误音效
                playSound(errorSound);
                
                setTimeout(() => {
                    selectedDisk.classList.remove('error');
                }, 500);
                return;
            }
        }

        // 移动圆盘
        currentTower.appendChild(selectedDisk);
        selectedDisk.classList.remove('selected');
        moveCount++;
        moveCountElement.textContent = moveCount;
        
        // 播放移动音效
        playSound(moveSound);

        // 检查游戏是否完成
        checkGameCompletion();

        // 重置选择状态
        selectedDisk = null;
        selectedTower = null;
    }
    
    // 从类名获取圆盘尺寸
    function getDiscSize(disk) {
        const sizeClass = Array.from(disk.classList)
            .find(cls => cls.startsWith('disk-color-'));
        if (sizeClass) {
            return parseInt(sizeClass.split('-')[2]);
        }
        return 0;
    }

    // 显示消息
    function showMessage(text) {
        const messageElement = document.getElementById('message');
        const messageCloneElement = document.getElementById('message-clone');
        
        // 如果没有文本，清空消息
        if (!text) {
            messageElement.textContent = '';
            messageElement.innerHTML = '';
            messageElement.classList.remove('perfect-message');
            messageElement.classList.remove('error-message');
            messageElement.classList.remove('rules-message');
            
            // 同时更新克隆消息
            if (messageCloneElement) {
                messageCloneElement.textContent = '';
                messageCloneElement.innerHTML = '';
                messageCloneElement.classList.remove('perfect-message');
                messageCloneElement.classList.remove('error-message');
                messageCloneElement.classList.remove('rules-message');
            }
            return;
        }

        // 检查是否完美通关
        const isPerfect = text.includes('完美') || text.includes('最少步数');
        
        // 更新主消息区域
        messageElement.innerHTML = text;
        
        // 移除所有可能的样式类
        messageElement.classList.remove('perfect-message');
        messageElement.classList.remove('rules-message');
        
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
        }
        
        // 同步更新克隆消息 - 用于平板横屏模式
        if (messageCloneElement) {
            messageCloneElement.innerHTML = messageElement.innerHTML;
            
            // 同步清除所有样式类
            messageCloneElement.classList.remove('perfect-message');
            messageCloneElement.classList.remove('rules-message');
            
            if (isPerfect) {
                messageCloneElement.classList.add('perfect-message');
            }
        }
    }

    // 检查游戏是否完成
    function checkGameCompletion() {
        // 如果最后一个塔上的圆盘数等于总圆盘数，游戏完成
        if (disksContainers[2].childElementCount === diskCount) {
            gameCompleted = true;
            // 启用圆盘数量选择按钮
            initDiskButtons();
            
            // 计算最少移动次数：2^n - 1
            const minMoves = Math.pow(2, diskCount) - 1;
            const isPerfect = moveCount === minMoves;
            
            if (isPerfect) {
                showMessage(`恭喜！你用了最少的 ${minMoves} 步完成了游戏！`);
                // 播放完美胜利音效
                playSound(perfectSound);
                // 显示完美胜利庆祝动画
                createCelebration(true);
            } else {
                showMessage(`恭喜！你用了 ${moveCount} 步完成了游戏！最少步数是 ${minMoves} 步`);
                // 播放普通胜利音效
                playSound(victorySound);
                // 显示普通胜利庆祝动画
                createCelebration(false);
            }
            
            // 添加庆祝动画到圆盘
            disksContainers[2].childNodes.forEach(disk => {
                disk.style.animation = 'celebrate 0.5s ease-in-out';
            });
        }
    }

    // 监听圆盘按钮点击
    diskButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (gameStarted && !gameCompleted) return; // 游戏进行中不允许更改
            
            diskCount = parseInt(button.dataset.value);
            diskCountInput.value = diskCount;
            initDiskButtons();
            initGame();
        });
    });

    // 监听重新开始按钮
    restartButton.addEventListener('click', initGame);

    // 初始化游戏
    initGame();
}); 