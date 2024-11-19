import express from "express";
import Joi from 'joi';
import Todo from '../schemas/todo.schema.js';

const router = express.Router();

const createTodoSchema = Joi.object({
    value: Joi.string().min(1).max(50).required(),
  });

router.post('/todos', async(req, res, next)=> {
// const {value} = req.body;
try {

const validation = await createTodoSchema.validateAsync(req.body);

const { value } = validation;

if(!value) {
    return res.status(400).json({errorMessage: "데이터 비어있음."});
}

const todoMaxOrder = await Todo.findOne().sort('-order').exec();//sort는 정렬 마이너스를 붙히면 내림차수 정렬.
//exec는 무조건 붙혀주기. 몽구스 할때. 프로미스로 동작함.

const order = todoMaxOrder ? todoMaxOrder.order +1 : 1;

const todo = new Todo ({value, order});
await todo.save();

return res.status(201).json({todo: todo});

} catch (error) {
    next(error);
  }
})


router.get('/todos', async(req, res, next)=>{

    const todos = await Todo.find().sort('-order').exec();

    return res.status(200).json({todos});
});


router.patch('/todos/:todoId', async (req, res) => {
    // 변경할 '해야할 일'의 ID 값을 가져옵니다.
    const { todoId } = req.params;
    // 클라이언트가 전달한 순서, 완료 여부, 내용 데이터를 가져옵니다.
    const { order, done, value } = req.body;
  
    // 변경하려는 '해야할 일'을 가져옵니다. 만약, 해당 ID값을 가진 '해야할 일'이 없다면 에러를 발생시킵니다.
    const currentTodo = await Todo.findById(todoId).exec();
    if (!currentTodo) {
      return res
        .status(404)
        .json({ errorMessage: '존재하지 않는 todo 데이터입니다.' });
    }
  
    if (order) {
      // 변경하려는 order 값을 가지고 있는 '해야할 일'을 찾습니다.
      const targetTodo = await Todo.findOne({ order }).exec();
      if (targetTodo) {
        // 만약, 이미 해당 order 값을 가진 '해야할 일'이 있다면, 해당 '해야할 일'의 order 값을 변경하고 저장합니다.
        targetTodo.order = currentTodo.order;
        await targetTodo.save();
      }
      // 변경하려는 '해야할 일'의 order 값을 변경합니니다.
      currentTodo.order = order;
    }
    if (done !== undefined) {
      // 변경하려는 '해야할 일'의 doneAt 값을 변경합니다.
      currentTodo.doneAt = done ? new Date() : null;
    }
    if (value) {
      // 변경하려는 '해야할 일'의 내용을 변경합니다.
      currentTodo.value = value;
    }
  
    // 변경된 '해야할 일'을 저장합니다.
    await currentTodo.save();
  
    return res.status(200).json({});
  });

  router.delete('/todos/:todoId', async (req, res, next) => {
    // 삭제할 '해야할 일'의 ID 값을 가져옵니다.
    const { todoId } = req.params;
  
    // 삭제하려는 '해야할 일'을 가져옵니다. 만약, 해당 ID값을 가진 '해야할 일'이 없다면 에러를 발생시킵니다.
    const todo = await Todo.findById(todoId).exec();
    if (!todo) {
      return res
        .status(404)
        .json({ errorMessage: '존재하지 않는 todo 데이터입니다.' });
    }
  
    // 조회된 '해야할 일'을 삭제합니다.
    await Todo.deleteOne({ _id: todoId }).exec();
  
    return res.status(200).json({});
  });

export default router;