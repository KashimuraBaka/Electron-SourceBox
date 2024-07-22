export default class FishPool {
  private obsresize: ResizeObserver
  private container: HTMLElement
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private points: SurfacePoint[]
  private fishes: Fish[]
  private isStart = false
  private watchId?: NodeJS.Timeout

  public width = 0
  public height = 0
  public reverse = false
  public pointInterval = 0
  public intervalCount = 0
  public fishCount = 0
  public axis = { x: 0, y: 0 }

  public POINT_INTERVAL = 5
  public FISH_COUNT = 3
  public MAX_INTERVAL_COUNT = 50
  public INIT_HEIGHT_RATE = 0.5
  public THRESHOLD = 50
  public WATCH_INTERVAL = 0.05

  constructor(container: HTMLElement, canvas: HTMLCanvasElement) {
    this.container = container
    this.container.style.overflow = 'hidden'
    this.canvas = canvas
    this.canvas.style.display = 'block' // canvas原来属性为inline, 换行后空格会占据 4px 高度
    this.context = canvas.getContext('2d') as CanvasRenderingContext2D
    this.points = []
    this.fishes = []

    // 监听容器尺寸变化
    this.obsresize = new ResizeObserver(this.onContainerSize.bind(this))
    this.obsresize.observe(this.container)

    this.setup()
    this.start()
  }

  private createSurfacePoints() {
    const count = Math.round(this.width / this.POINT_INTERVAL)
    this.pointInterval = this.width / (count - 1)
    this.points.push(new SurfacePoint(this, 0))

    for (let i = 1; i < count; i++) {
      const point = new SurfacePoint(this, i * this.pointInterval)
      const previous = this.points[i - 1]

      point.setPreviousPoint(previous)
      previous.setNextPoint(point)
      this.points.push(point)
    }
  }

  private setup() {
    clearTimeout(this.watchId)
    this.points.length = 0
    this.fishes.length = 0
    this.intervalCount = this.MAX_INTERVAL_COUNT
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.fishCount = (((this.FISH_COUNT * this.width) / 500) * this.height) / 500
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.reverse = false

    this.fishes.push(new Fish(this))
    this.createSurfacePoints()
  }

  /**
   * 鱼塘尺寸发生变化
   */
  private onContainerSize() {
    clearTimeout(this.watchId)
    this.watchId = setTimeout(this.setup.bind(this), this.WATCH_INTERVAL)
  }

  private getAxis(event: MouseEvent) {
    const offset = this.getOffset(this.container)
    return {
      x: event.clientX - offset.left + document.body.scrollLeft,
      y: event.clientY - offset.top + document.body.scrollTop
    }
  }

  private getOffset(Node: HTMLElement, offset?: { top: number; left: number }) {
    if (!offset) {
      offset = { top: 0, left: 0 }
    }
    if (Node == document.body) {
      //当该节点为body节点时，结束递归
      return offset
    }
    offset.top += Node.offsetTop
    offset.left += Node.offsetLeft
    return this.getOffset(Node.parentNode as HTMLElement, offset) // 向上累加offset里的值
  }

  public startEpicenter(event: MouseEvent) {
    this.axis = this.getAxis(event)
  }

  public moveEpicenter(event: MouseEvent) {
    const axis = this.getAxis(event)
    if (!this.axis) {
      this.axis = axis
    }
    this.generateEpicenter(axis.x, axis.y, axis.y - this.axis.y)
    this.axis = axis
  }

  public generateEpicenter(x: number, y: number, velocity: number) {
    if (y < this.height / 2 - this.THRESHOLD || y > this.height / 2 + this.THRESHOLD) {
      return
    }
    const index = Math.round(x / this.pointInterval)

    if (index < 0 || index >= this.points.length) {
      return
    }
    this.points[index].interfere(y, velocity)
  }

  private controlStatus() {
    for (let i = 0, count = this.points.length; i < count; i++) {
      this.points[i].updateSelf()
    }
    for (let i = 0, count = this.points.length; i < count; i++) {
      this.points[i].updateNeighbors()
    }
    if (this.fishes.length < this.fishCount) {
      if (--this.intervalCount == 0) {
        this.intervalCount = this.MAX_INTERVAL_COUNT
        this.fishes.push(new Fish(this))
      }
    }
  }

  private play() {
    if (this.isStart) {
      requestAnimationFrame(this.play.bind(this))
    }

    this.controlStatus()
    this.context.clearRect(0, 0, this.width, this.height)
    this.context.fillStyle = 'hsl(0, 0%, 95%)'

    for (let i = 0, count = this.fishes.length; i < count; i++) {
      this.fishes[i].render(this.context)
    }
    this.context.save()
    this.context.globalCompositeOperation = 'xor'
    this.context.beginPath()
    this.context.moveTo(0, this.reverse ? 0 : this.height)

    for (let i = 0, count = this.points.length; i < count; i++) {
      this.points[i].render(this.context)
    }
    this.context.lineTo(this.width, this.reverse ? 0 : this.height)
    this.context.closePath()
    this.context.fill()
    this.context.restore()
  }

  /**
   * 翻转鱼塘画布
   */
  public reverseVertical() {
    this.reverse = !this.reverse
    for (let i = 0, count = this.fishes.length; i < count; i++) {
      this.fishes[i].reverseVertical()
    }
  }

  public stop() {
    this.isStart = false
  }

  public start() {
    this.isStart = true
    this.play()
  }

  public destory() {
    this.stop()
    this.setup()
    this.obsresize.unobserve(this.container)
    this.obsresize.disconnect()
  }
}

class SurfacePoint {
  private renderer: FishPool
  private x: number
  private initHeight: number
  private height: number
  private fy: number
  private force: { previous: number; next: number }

  private previous?: SurfacePoint
  private next?: SurfacePoint

  public SPRING_CONSTANT = 0.03
  public SPRING_FRICTION = 0.9
  public WAVE_SPREAD = 0.3
  public ACCELARATION_RATE = 0.01

  constructor(renderer: FishPool, x: number) {
    this.renderer = renderer
    this.x = x
    this.initHeight = this.renderer.height * this.renderer.INIT_HEIGHT_RATE
    this.height = this.initHeight
    this.fy = 0
    this.force = { previous: 0, next: 0 }
  }

  public setPreviousPoint(previous: SurfacePoint) {
    this.previous = previous
  }

  public setNextPoint(next: SurfacePoint) {
    this.next = next
  }

  public interfere(y: number, velocity: number) {
    this.fy = this.renderer.height * this.ACCELARATION_RATE * (this.renderer.height - this.height - y >= 0 ? -1 : 1) * Math.abs(velocity)
  }

  public updateSelf() {
    this.fy += this.SPRING_CONSTANT * (this.initHeight - this.height)
    this.fy *= this.SPRING_FRICTION
    this.height += this.fy
  }

  public updateNeighbors() {
    if (this.previous) {
      this.force.previous = this.WAVE_SPREAD * (this.height - this.previous.height)
    }
    if (this.next) {
      this.force.next = this.WAVE_SPREAD * (this.height - this.next.height)
    }
  }

  public render(context: CanvasRenderingContext2D) {
    if (this.previous) {
      this.previous.height += this.force.previous
      this.previous.fy += this.force.previous
    }
    if (this.next) {
      this.next.height += this.force.next
      this.next.fy += this.force.next
    }
    context.lineTo(this.x, this.renderer.height - this.height)
  }
}

class Fish {
  private renderer: FishPool
  private direction = false
  private isOut = false
  private x = 0
  private y = 0
  private vx = 0
  private vy = 0
  private ay = 0
  private previousY = 0
  private theta = 0
  private phi = 0

  private GRAVITY = 0.5

  constructor(renderer: FishPool) {
    this.renderer = renderer
    this.init()
  }

  private init() {
    this.direction = Math.random() < 0.5
    this.x = this.direction ? this.renderer.width + this.renderer.THRESHOLD : -this.renderer.THRESHOLD
    this.previousY = this.y
    this.vx = this.getRandomValue(4, 10) * (this.direction ? -1 : 1)

    if (this.renderer.reverse) {
      this.y = this.getRandomValue((this.renderer.height * 1) / 10, (this.renderer.height * 4) / 10)
      this.vy = this.getRandomValue(2, 5)
      this.ay = this.getRandomValue(0.05, 0.2)
    } else {
      this.y = this.getRandomValue((this.renderer.height * 6) / 10, (this.renderer.height * 9) / 10)
      this.vy = this.getRandomValue(-5, -2)
      this.ay = this.getRandomValue(-0.2, -0.05)
    }
    this.isOut = false
    this.theta = 0
    this.phi = 0
  }

  private getRandomValue(min: number, max: number) {
    return min + (max - min) * Math.random()
  }

  public reverseVertical() {
    this.isOut = !this.isOut
    this.ay *= -1
  }

  private controlStatus() {
    this.previousY = this.y
    this.x += this.vx
    this.y += this.vy
    this.vy += this.ay

    if (this.renderer.reverse) {
      if (this.y > this.renderer.height * this.renderer.INIT_HEIGHT_RATE) {
        this.vy -= this.GRAVITY
        this.isOut = true
      } else {
        if (this.isOut) {
          this.ay = this.getRandomValue(0.05, 0.2)
        }
        this.isOut = false
      }
    } else {
      if (this.y < this.renderer.height * this.renderer.INIT_HEIGHT_RATE) {
        this.vy += this.GRAVITY
        this.isOut = true
      } else {
        if (this.isOut) {
          this.ay = this.getRandomValue(-0.2, -0.05)
        }
        this.isOut = false
      }
    }
    if (!this.isOut) {
      this.theta += Math.PI / 20
      this.theta %= Math.PI * 2
      this.phi += Math.PI / 30
      this.phi %= Math.PI * 2
    }
    this.renderer.generateEpicenter(this.x + (this.direction ? -1 : 1) * this.renderer.THRESHOLD, this.y, this.y - this.previousY)

    if ((this.vx > 0 && this.x > this.renderer.width + this.renderer.THRESHOLD) || (this.vx < 0 && this.x < -this.renderer.THRESHOLD)) {
      this.init()
    }
  }

  public render(context: CanvasRenderingContext2D) {
    context.save()
    context.translate(this.x, this.y)
    context.rotate(Math.PI + Math.atan2(this.vy, this.vx))
    context.scale(1, this.direction ? 1 : -1)
    context.beginPath()
    context.moveTo(-30, 0)
    context.bezierCurveTo(-20, 15, 15, 10, 40, 0)
    context.bezierCurveTo(15, -10, -20, -15, -30, 0)
    context.fill()

    context.save()
    context.translate(40, 0)
    context.scale(0.9 + 0.2 * Math.sin(this.theta), 1)
    context.beginPath()
    context.moveTo(0, 0)
    context.quadraticCurveTo(5, 10, 20, 8)
    context.quadraticCurveTo(12, 5, 10, 0)
    context.quadraticCurveTo(12, -5, 20, -8)
    context.quadraticCurveTo(5, -10, 0, 0)
    context.fill()
    context.restore()

    context.save()
    context.translate(-3, 0)
    context.rotate((Math.PI / 3 + (Math.PI / 10) * Math.sin(this.phi)) * (this.renderer.reverse ? -1 : 1))

    context.beginPath()

    if (this.renderer.reverse) {
      context.moveTo(5, 0)
      context.bezierCurveTo(10, 10, 10, 30, 0, 40)
      context.bezierCurveTo(-12, 25, -8, 10, 0, 0)
    } else {
      context.moveTo(-5, 0)
      context.bezierCurveTo(-10, -10, -10, -30, 0, -40)
      context.bezierCurveTo(12, -25, 8, -10, 0, 0)
    }
    context.closePath()
    context.fill()
    context.restore()
    context.restore()
    this.controlStatus()
  }
}
