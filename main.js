const httpServer = require('http').createServer()

const io = require("socket.io")(httpServer, {
    cors: {
        // The origin is the same as the Vue app domain. Change if necessary
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
})

const Colors = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",

    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",

    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m",
}

const UserType = {
    CHEF: 'EC',
    DELIVERY: 'ED',
    MANAGER: 'EM',
    CUSTOMER: 'C',
    EMPLOYEE: 'EE'
}

const Employee = [UserType.CHEF, UserType.DELIVERY, UserType.MANAGER]

const broadcastEvents = [
    "products-update",
    "board-update",
]

const employeesEvents = [
    "orders-update",
]

httpServer.listen(8080, () => {
    console.clear()
    console.log('\nListening on http://localhost:8080')
})

io.on('connection', (socket) => {
    console.log(`Client ${Colors.FgYellow}${socket.id}${Colors.Reset} has ${Colors.FgGreen}connected${Colors.Reset}`)

    socket.on("disconnect", (reason) => {
        console.log(`Client ${Colors.FgYellow}${socket.id}${Colors.Reset} has ${Colors.FgRed}disconnected${Colors.Reset}`)
    });

    socket.on("login", user => {
        if (user?.type && !socket.rooms.has(user.type)) {
            socket.join(user.id)
            socket.join(user.type)
            if (Employee.indexOf(user.type) >= 0) {
                socket.join(UserType.EMPLOYEE)
                console.log(`Client ${Colors.FgYellow}${socket.id}${Colors.Reset} joined room ${UserType.EMPLOYEE}`)
            }
            console.log(`Client ${Colors.FgYellow}${socket.id}${Colors.Reset} joined room ${user.type}`)
        }
    })

    socket.on("logout", (user) => {
        if (user?.type && socket.rooms.has(user.type)) {
            socket.leave(user.id)
            socket.leave(user.type)
            if (Employee.indexOf(user.type) >= 0) {
                socket.leave(UserType.EMPLOYEE)
                console.log(`Client ${Colors.FgYellow}${socket.id}${Colors.Reset} leaved room ${UserType.EMPLOYEE}`)
            }
            console.log(`Client ${Colors.FgYellow}${socket.id}${Colors.Reset} leaved room ${user.type}`)
        }
    })

    socket.onAny((event, ...data) => {
        console.log(`Client ${Colors.FgYellow}${socket.id}${Colors.Reset} notify ${Colors.FgCyan}${event}${Colors.Reset}`)
    })

    broadcastEvents.forEach(e => {
        socket.on(e, (data = null) => {
            socket.broadcast.emit(e, data)
        })
    })

    employeesEvents.forEach(e => {
        socket.on(e, (data = null) => {
            socket.to(UserType.EMPLOYEE).emit(e, data)
        })
    })
})
