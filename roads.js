// road.js - إدارة الطريق والمثلثات
class Road {
    constructor(scene, width = 4, triangleSpacing = 8) {
        this.scene = scene;
        this.width = width;
        this.triangleSpacing = triangleSpacing;
        this.triangles = [];
        this.triangleCount = 0;
        this.roadSegments = [];
        this.roadType = 'classic';
        
        this.createRoad();
        this.createInitialTriangles();
    }

    createRoad() {
        // إنشاء قطع الطريق الطويلة
        const segmentLength = 100;
        const numSegments = 3;
        
        for (let i = 0; i < numSegments; i++) {
            const geometry = new THREE.PlaneGeometry(this.width, segmentLength);
            const material = new THREE.MeshStandardMaterial({
                color: 0x333333,
                roughness: 0.8,
                metalness: 0.2
            });
            
            const segment = new THREE.Mesh(geometry, material);
            segment.rotation.x = -Math.PI / 2;
            segment.position.z = -i * segmentLength;
            segment.receiveShadow = true;
            
            this.scene.add(segment);
            this.roadSegments.push(segment);
        }
    }

    createInitialTriangles() {
        // إنشاء مثلثات أولية
        for (let i = 0; i < 20; i++) {
            this.createTriangle(i);
        }
    }

    createTriangle(index) {
        const triangleNumber = this.triangleCount + 1;
        const zPosition = -index * this.triangleSpacing - 10;
        
        // تحديد الجانب عشوائياً (يمين أو يسار)
        const side = Math.random() > 0.5 ? 1 : -1;
        const xPosition = side * (this.width / 4);
        
        // هندسة المثلث
        const geometry = new THREE.ConeGeometry(this.width / 2, 1, 3);
        geometry.rotateX(Math.PI / 2);
        
        // لون المثلث (تدرج ألوان)
        const hue = (triangleNumber * 30) % 360;
        const color = new THREE.Color(`hsl(${hue}, 100%, 50%)`);
        
        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5,
            shininess: 100
        });
        
        const triangle = new THREE.Mesh(geometry, material);
        triangle.position.set(xPosition, 0.5, zPosition);
        triangle.castShadow = true;
        
        // إضافة رقم المثلث
        const numberCanvas = this.createNumberTexture(triangleNumber);
        const numberTexture = new THREE.CanvasTexture(numberCanvas);
        const numberMaterial = new THREE.MeshBasicMaterial({
            map: numberTexture,
            transparent: true
        });
        const numberGeometry = new THREE.PlaneGeometry(0.8, 0.8);
        const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
        numberMesh.position.set(xPosition, 1.5, zPosition);
        numberMesh.rotation.x = -Math.PI / 2;
        
        this.scene.add(triangle);
        this.scene.add(numberMesh);
        
        this.triangles.push({
            mesh: triangle,
            numberMesh: numberMesh,
            number: triangleNumber,
            passed: false,
            side: side,
            zPosition: zPosition
        });
        
        this.triangleCount++;
    }

    createNumberTexture(number) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // خلفية شفافة
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, 128, 128);
        
        // رسم الرقم
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(number.toString(), 64, 64);
        
        return canvas;
    }

    update(speed, ballPosition) {
        const moveAmount = speed / 100;
        
        // تحريك المثلثات
        this.triangles.forEach((triangle, index) => {
            triangle.mesh.position.z += moveAmount;
            triangle.numberMesh.position.z += moveAmount;
            triangle.zPosition += moveAmount;
            
            // تدوير المثلث
            triangle.mesh.rotation.y += 0.02;
            
            // حذف المثلثات التي تجاوزت الكاميرا
            if (triangle.mesh.position.z > 10) {
                this.scene.remove(triangle.mesh);
                this.scene.remove(triangle.numberMesh);
                this.triangles.splice(index, 1);
                
                // إنشاء مثلث جديد
                const lastTriangle = this.triangles[this.triangles.length - 1];
                const newIndex = lastTriangle ? 
                    Math.abs(lastTriangle.zPosition / this.triangleSpacing) + 1 : 0;
                this.createTriangle(newIndex);
            }
        });
        
        // تحريك قطع الطريق
        this.roadSegments.forEach(segment => {
            segment.position.z += moveAmount;
            
            if (segment.position.z > 100) {
                segment.position.z -= 300;
            }
        });
    }

    checkCollision(ballBounds) {
        for (let triangle of this.triangles) {
            if (triangle.passed) continue;
            
            const triangleBounds = {
                minX: triangle.mesh.position.x - (this.width / 4),
                maxX: triangle.mesh.position.x + (this.width / 4),
                minZ: triangle.mesh.position.z - 0.5,
                maxZ: triangle.mesh.position.z + 0.5
            };
            
            // التحقق من التصادم
            if (ballBounds.minX < triangleBounds.maxX &&
                ballBounds.maxX > triangleBounds.minX &&
                ballBounds.minZ < triangleBounds.maxZ &&
                ballBounds.maxZ > triangleBounds.minZ) {
                return true; // تصادم!
            }
            
            // التحقق إذا تجاوز الكرة المثلث بنجاح
            if (ballBounds.minZ > triangleBounds.maxZ && !triangle.passed) {
                triangle.passed = true;
                return 'passed'; // تجاوز بنجاح
            }
        }
        
        return false;
    }

    changeRoadType(type) {
        this.roadType = type;
        
        let color;
        switch(type) {
            case 'neon':
                color = 0x00ffff;
                break;
            case 'gradient':
                color = 0xff0066;
                break;
            default:
                color = 0x333333;
        }
        
        this.roadSegments.forEach(segment => {
            segment.material.color.setHex(color);
        });
    }

    getPassedTriangles() {
        return this.triangles.filter(t => t.passed).length;
    }

    reset() {
        // حذف جميع المثلثات
        this.triangles.forEach(triangle => {
            this.scene.remove(triangle.mesh);
            this.scene.remove(triangle.numberMesh);
        });
        
        this.triangles = [];
        this.triangleCount = 0;
        
        // إعادة إنشاء المثلثات
        this.createInitialTriangles();
    }
}Gradient(leftX, roadY, rightX, roadY);
            const glowColor = this.pattern.color || '#00ffff';
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(0.5, glowColor + Math.floor(0.1 * perspective * 255).toString(16).padStart(2, '0'));
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(leftX, roadY - 100 * perspective, segmentWidth, 200 * perspective);
        }

        // Road edges
        ctx.strokeStyle = this.pattern.color + '80';
        ctx.lineWidth = 3 * perspective;
        ctx.beginPath();
        ctx.moveTo(leftX, roadY - 100 * perspective);
        ctx.lineTo(leftX, roadY + 100 * perspective);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rightX, roadY - 100 * perspective);
        ctx.lineTo(rightX, roadY + 100 * perspective);
        ctx.stroke();
    }

    isOffScreen() {
        return this.z > 15;
    }
}

class RoadManager {
    constructor() {
        this.segments = [];
        this.patterns = ROAD_PATTERNS;
        this.currentPattern = this.patterns[0];
        this.nextPatternZ = 50;
    }

    initialize() {
        this.segments = [];
        for (let i = 0; i < CONFIG.ROAD.INITIAL_SEGMENTS; i++) {
            this.addSegment(-i * CONFIG.ROAD.SEGMENT_LENGTH);
        }
    }

    addSegment(z) {
        // Change pattern occasionally
        if (z < this.nextPatternZ - 200) {
            this.currentPattern = this.patterns[Math.floor(Math.random() * this.patterns.length)];
            this.nextPatternZ = z - 50;
        }

        const segment = new RoadSegment(z, this.currentPattern);
        this.segments.push(segment);
    }

    update(speed) {
        // Update all segments
        this.segments.forEach(seg => seg.update(speed));

        // Remove off-screen segments
        this.segments = this.segments.filter(seg => !seg.isOffScreen());

        // Add new segments
        if (this.segments.length < CONFIG.ROAD.INITIAL_SEGMENTS) {
            const lastZ = Math.min(...this.segments.map(s => s.z));
            this.addSegment(lastZ - CONFIG.ROAD.SEGMENT_LENGTH);
        }
    }

    render(ctx, canvas) {
        // Sort by distance for proper rendering
        const sorted = [...this.segments].sort((a, b) => a.z - b.z);
        sorted.forEach(seg => seg.render(ctx, canvas));
    }

    setPattern(patternId) {
        const pattern = this.patterns.find(p => p.id === patternId);
        if (pattern) {
            this.currentPattern = pattern;
        }
    }

    getAvailablePatterns() {
        return this.patterns;
    }

    reset() {
        this.initialize();
        this.nextPatternZ = 50;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RoadManager, RoadSegment, ROAD_PATTERNS };
}