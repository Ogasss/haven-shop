const Timer =  {
    date: Date,
    newTimer: function(){
        if(arguments.length === 0){
            this.date = new Date()
            this.format()
            return Timer
        }else
        if(arguments.length === 1){
            this.date = arguments[0]
            this.format()
            return Timer
        }else
        {
            arguments[1] -= 1
            this.date = new Date(...arguments)
            this.format()
            return Timer
        }
    },//得到一个当前时间

    format(pattern = 'YYYY-MM-DD'){
        const year = this.date.getFullYear()
        this.date.year = year
        const month = this.date.getMonth() + 1
        this.date.month = month
        const day = this.date.getDate()
        this.date.day = day
        const hour = this.date.getHours()
        this.date.hour = hour
        const minute = this.date.getMinutes()
        this.date.minute = minute
        const second = this.date.getSeconds()
        this.date.second = second
        const msecond = this.date.getMilliseconds()
        this.date.msecond = msecond
        const newPattern = pattern.replace(/YYYY/g, year.toString())
        .replace(/MM/, month.toString().padStart(2, '0'))
        .replace(/DD/, day.toString().padStart(2, '0'))
        .replace(/HH/, hour.toString().padStart(2, '0'))
        .replace(/mm/, minute.toString().padStart(2, '0'))
        .replace(/ss/, second.toString().padStart(2, '0'))
        .replace(/SSS/, msecond.toString().padStart(3, '0'))
        this.date.pattern = newPattern
        this.date.totalDaysOfMonth = this.getTotalDaysOfMonth(this.date.year, this.date.month)
        this.date.passedDaysOfYear = this.getPassedDaysOfYear(this.date.year,this.date.month,this.date.day)
        this.date.totalDaysOfYear = this.getTotalDaysOfYear(this.date.year)
        return Timer
    },//格式化并初始化当前时间

    getTotalDaysOfMonth(year,month){
        const newDate = new Date(this.date.year, this.date.month -1, 32)
        const totalDays = 32 - newDate.getDate()
        return totalDays
    },

    getTotalDaysOfYear(year){
        if(year%4===0){
            return 366
        }else{
            return 365
        }
    },

    getPassedDaysOfYear(year,month,day){
        let days = 0
        for(let i=1;i<month;i++){
            const day = this.getTotalDaysOfMonth(year,month)
            days += day
        }
        days += day
        return days
    },

    toFirstDayOfMonth(){
        return this.newTimer(this.date.year,this.date.month,1)
    },

    passDays(number){
        const oldDate = {
            year: this.date.year,
            month: this.date.month,
            day: this.date.day
        }
        const newDate = {
            year: this.date.year,
            month: this.date.month,
            day: this.date.day
        }
        const totalDaysOfMonth = this.date.totalDaysOfMonth
        const totalDays = oldDate.day + number
        if(number>=0){
            if( totalDays <= totalDaysOfMonth ){
                newDate.day = totalDays
            }else{
                newDate.day = totalDays - totalDaysOfMonth
            }
            if(totalDays > totalDaysOfMonth){
                if(oldDate.month+1<=12){
                    newDate.month = oldDate.month+1
                }else{
                    newDate.month = oldDate.month+1-12
                    newDate.year = oldDate.year+1
                }
            }
            
        }else{
            const totalDays = oldDate.day + number
            if(totalDays>=0){
                newDate.day = totalDays
            }else{
                newDate.day = totalDaysOfMonth + totalDays
            }
            if(totalDays<0){
                if(oldDate.month!==1){
                    newDate.month = oldDate.month-1
                }else{
                    newDate.month = 12
                    newDate.year = oldDate.year-1
                }
            }

        }
        return this.newTimer(newDate.year,newDate.month,newDate.day)
    },//从当前时间开始渡过多少天

    getBetweenDays(){
        if(arguments.length === 3){
            //(2011,2,4)
            const targetDate = new Date(arguments[0],arguments[1]-1,arguments[2])
            let result = Math.abs(this.date.getTime() - targetDate.getTime())
            let betweenDays = Math.floor(result / (24*3600*1000))
            return betweenDays + 1
        }else if(arguments.length === 1){
            //[2011,2,4]
            const targetDate = new Date(arguments[0][0],arguments[0][1]-1,arguments[0][2])
            let result = Math.abs(this.date.getTime() - targetDate.getTime())
            let betweenDays = Math.floor(result / (24*3600*1000))
            return betweenDays + 1
        }else if(arguments.length === 2){
            //[2011,2,4],[2012,4,5]
            const targetDate1 = new Date(arguments[0][0],arguments[0][1],arguments[0][2])
            const targetDate2 = new Date(arguments[1][0],arguments[1][1],arguments[1][2])
            let result = Math.abs(targetDate1.getTime() - targetDate2.getTime())
            let betweenDays = Math.floor(result / (24*3600*1000))
            return betweenDays + 1
        }
    }
}

exports.Timer = Timer