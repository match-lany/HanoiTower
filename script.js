document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const diskCountInput = document.getElementById('diskCount');
    const diskButtons = document.querySelectorAll('.disk-button');
    const restartButton = document.getElementById('restart');
    const moveCountElement = document.getElementById('moveCount');
    const messageElement = document.getElementById('message');
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
        const elementCount = isPerfect ? 100 : 50;
        
        for (let i = 0; i < elementCount; i++) {
            // 创建纸屑或星星
            const element = document.createElement('div');
            
            // 对于完美通关，创建更多的星星
            if (isPerfect && i % 3 === 0) {
                element.className = 'star';
                element.style.backgroundColor = getRandomColor();
                element.style.animation = `twinkle ${getRandomFloat(1, 2)}s infinite alternate, fall ${getRandomFloat(3, 6)}s ${getRandomFloat(0, 3)}s forwards`;
            } else {
                element.className = 'confetti';
                element.style.backgroundColor = getRandomColor();
                element.style.width = `${getRandomFloat(5, 15)}px`;
                element.style.height = `${getRandomFloat(5, 15)}px`;
                element.style.animation = `fall ${getRandomFloat(2, 5)}s ${getRandomFloat(0, 2)}s forwards`;
            }
            
            // 设置起始位置
            element.style.left = `${getRandomFloat(0, 100)}%`;
            element.style.opacity = '0';
            
            container.appendChild(element);
        }
        
        // 定时关闭动画
        setTimeout(() => {
            container.style.display = 'none';
        }, isPerfect ? 7000 : 5000);
    }
    
    // 生成随机颜色
    function getRandomColor() {
        const colors = [
            '#ff7675', '#e74c3c', // 红
            '#f39c12', '#e67e22', // 橙
            '#fdcb6e', '#f1c40f', // 黄
            '#55efc4', '#2ecc71', // 绿
            '#81ecec', '#00cec9', // 青
            '#74b9ff', '#0984e3', // 蓝
            '#a29bfe', '#6c5ce7'  // 紫
        ];
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
        messageElement.textContent = '';
        
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
        
        // 隐藏庆祝动画容器
        celebrationContainer.style.display = 'none';
        perfectCelebrationContainer.style.display = 'none';
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
        messageElement.textContent = text;
        setTimeout(() => {
            messageElement.textContent = '';
        }, 2000);
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