import { Request, Response } from 'express';
import { Resource } from '../models/resource.model';

export class ResourceController {
    async getResources(req: Request, res: Response) {
        try {
            const { resourceType } = req.params;
            const resources = await Resource.find({ type: resourceType });
            res.json(resources);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener recursos' });
        }
    }

    async getResourceDetails(req: Request, res: Response) {
        try {
            const { resourceType, id } = req.params;
            const resource = await Resource.findOne({ type: resourceType, _id: id })
                .populate('components')
                .populate('history');
            
            if (!resource) {
                return res.status(404).json({ message: 'Recurso no encontrado' });
            }
            
            res.json(resource);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener detalles del recurso' });
        }
    }

    async generateReport(req: Request, res: Response) {
        try {
            const { reportType } = req.params;
            let reportData;
            
            switch(reportType) {
                case 'modifications':
                    reportData = await Resource.find().sort({ lastModified: -1 }).limit(50);
                    break;
                case 'inventory':
                    reportData = await Resource.aggregate([
                        { $group: { _id: "$type", count: { $sum: 1 } } }
                    ]);
                    break;
                case 'status':
                    reportData = await Resource.aggregate([
                        { $group: { _id: "$status", count: { $sum: 1 } } }
                    ]);
                    break;
                default:
                    return res.status(400).json({ message: 'Tipo de informe no válido' });
            }
            
            res.json(reportData);
        } catch (error) {
            res.status(500).json({ message: 'Error al generar el informe' });
        }
    }
}